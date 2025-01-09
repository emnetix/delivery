package delivery

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

type ENT02DeliveryAsync struct {
	ID         string
	PeerID     string
	conn       *websocket.Conn
	done       chan struct{}
	isProd     bool
	socketURL  string
	socketPath string

	// Callback functions
	OnConnected    func() error
	OnDisconnected func() error
	OnDelivery     func(data interface{}) error
	OnError        func(data interface{}) error
}

func NewENT02DeliveryAsync() *ENT02DeliveryAsync {
	isProd := os.Getenv("ENV") == "prod"

	protocol := "wss://"
	host := "delivery.emnetix.net"
	if !isProd {
		protocol = "ws://"
		host = "localhost:8000"
	}

	client := &ENT02DeliveryAsync{
		isProd:     isProd,
		socketURL:  protocol + host,
		socketPath: "/api/v1/ws/ent02delivery",
		done:       make(chan struct{}),
	}

	// Initialize default callbacks
	noop := func() error { return nil }
	noopData := func(interface{}) error { return nil }

	client.OnConnected = noop
	client.OnDisconnected = noop
	client.OnDelivery = noopData
	client.OnError = noopData

	return client
}

func (d *ENT02DeliveryAsync) getSocketIOHandshake() error {
	// Convert WebSocket URL to HTTP URL for handshake
	transportURL := d.socketURL
	if strings.HasPrefix(transportURL, "ws://") {
		transportURL = "http://" + transportURL[5:]
	} else if strings.HasPrefix(transportURL, "wss://") {
		transportURL = "https://" + transportURL[6:]
	}

	// Socket.IO handshake URL
	handshakeURL := fmt.Sprintf("%s%s/?EIO=4&transport=polling", transportURL, d.socketPath)

	fmt.Printf("Performing handshake with: %s\n", handshakeURL)

	client := &http.Client{
		Timeout: time.Second * 10,
	}

	resp, err := client.Get(handshakeURL)
	if err != nil {
		return fmt.Errorf("handshake request failed: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("handshake failed with status %d: %s", resp.StatusCode, string(body))
	}

	return nil
}

func (d *ENT02DeliveryAsync) CreateID() string {
	return uuid.New().String()
}

func (d *ENT02DeliveryAsync) SetID(id string) {
	d.ID = id
}

func (d *ENT02DeliveryAsync) SetPeerID(id string) {
	d.PeerID = id
}

func (d *ENT02DeliveryAsync) ConnectSocket() error {
	// First perform Socket.IO handshake
	if err := d.getSocketIOHandshake(); err != nil {
		return fmt.Errorf("handshake error: %v", err)
	}

	// Connect WebSocket with Socket.IO parameters
	wsURL := fmt.Sprintf("%s%s/?EIO=4&transport=websocket", d.socketURL, d.socketPath)
	fmt.Printf("Connecting WebSocket to: %s\n", wsURL)

	dialer := websocket.Dialer{
		EnableCompression: true,
		HandshakeTimeout:  10 * time.Second,
	}

	conn, _, err := dialer.Dial(wsURL, nil)
	if err != nil {
		return fmt.Errorf("websocket dial error: %v", err)
	}
	d.conn = conn

	// Send Socket.IO upgrade packet
	if err := conn.WriteMessage(websocket.TextMessage, []byte("40")); err != nil {
		return fmt.Errorf("upgrade packet error: %v", err)
	}

	// Send set-id message
	if d.ID != "" {
		dataStr := fmt.Sprintf(`{"type":"set-id","id":"%s"}`, d.ID)
		socketMessage := []interface{}{"set-id", dataStr}
		data, err := json.Marshal(socketMessage)
		if err != nil {
			return fmt.Errorf("marshal error: %v", err)
		}
		message := fmt.Sprintf("42%s", string(data))
		if err := d.conn.WriteMessage(websocket.TextMessage, []byte(message)); err != nil {
			return fmt.Errorf("set-id error: %v", err)
		}
	}

	// Start heartbeat goroutine
	go func() {
		ticker := time.NewTicker(25 * time.Second)
		defer ticker.Stop()

		for {
			select {
			case <-d.done:
				return
			case <-ticker.C:
				if err := d.conn.WriteMessage(websocket.TextMessage, []byte("2")); err != nil {
					d.OnError(fmt.Sprintf("heartbeat error: %v", err))
					return
				}
			}
		}
	}()

	go d.handleMessages()
	d.OnConnected()

	return nil
}

func (d *ENT02DeliveryAsync) handleMessages() {
	defer func() {
		d.conn.Close()
		d.OnDisconnected()
		close(d.done)
	}()

	for {
		_, message, err := d.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				d.OnError(fmt.Sprintf("read error: %v", err))
			}
			return
		}

		// Socket.IO message format: message type (1 char) + json data
		if len(message) > 0 {
			msgType := string(message[0])

			switch msgType {
			case "2": // PING
				d.conn.WriteMessage(websocket.TextMessage, []byte("3")) // PONG
				continue
			case "4": // MESSAGE

				if len(message) > 2 {
					messageContent := message[2:]

					// Parse the Socket.IO message array ["event", data]
					var socketMessage []json.RawMessage
					if err := json.Unmarshal(messageContent, &socketMessage); err != nil {
						d.OnError(fmt.Sprintf("json parse error: %v", err))
						continue
					}

					if len(socketMessage) < 2 {
						continue
					}

					// Get the event type (first element)
					var eventType string
					if err := json.Unmarshal(socketMessage[0], &eventType); err != nil {
						d.OnError(fmt.Sprintf("event type parse error: %v", err))
						continue
					}

					// Parse the data (second element)
					var data map[string]interface{}
					if err := json.Unmarshal(socketMessage[1], &data); err != nil {
						d.OnError(fmt.Sprintf("data parse error: %v", err))
						continue
					}

					// Handle the event
					switch eventType {
					case "delivery":
						d.OnDelivery(data)
					case "error":
						// 에러 객체를 그대로 전달
						d.OnError(data)
					}
				}
			}
		}
	}
}

func (d *ENT02DeliveryAsync) RegisterDevice() error {
	maxRetries := 3
	var lastErr error

	for i := 0; i < maxRetries; i++ {
		err := d.ConnectSocket()
		if err == nil {
			return nil
		}
		lastErr = err

		if i < maxRetries-1 {
			time.Sleep(time.Second * 3)
		}
	}

	return fmt.Errorf("failed to connect after %d retries: %v", maxRetries, lastErr)
}

func (d *ENT02DeliveryAsync) sendMessage(msg interface{}) error {
	if d.conn == nil {
		return fmt.Errorf("connection not established")
	}

	// JSON 문자열로 직렬화
	dataStr, err := json.Marshal(msg)
	if err != nil {
		return err
	}

	// ["delivery", message] 형태의 배열 생성
	socketMessage := []interface{}{"delivery", string(dataStr)}
	data, err := json.Marshal(socketMessage)
	if err != nil {
		return err
	}

	// Socket.IO 메시지 형식 (42 prefix + JSON 문자열)
	message := fmt.Sprintf("42%s", string(data))
	return d.conn.WriteMessage(websocket.TextMessage, []byte(message))
}

func (d *ENT02DeliveryAsync) SendData(data interface{}) error {
	message := map[string]interface{}{
		"type":    "delivery",
		"from":    d.ID,
		"to":      d.PeerID,
		"payload": data,
	}

	return d.sendMessage(message)
}

func (d *ENT02DeliveryAsync) Close() {
	if d.conn != nil {
		d.conn.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(websocket.CloseNormalClosure, ""))
		d.conn.Close()
		<-d.done
	}
}
