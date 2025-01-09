package main

import (
	"bufio"
	delivery "delivery/ent02client" // 이전에 만든 패키지 import
	"encoding/json"
	"fmt"
	"os"
	"os/signal"
	"syscall"
	"time"
)

var deliveryClient *delivery.ENT02DeliveryAsync

func printUsage() {
	fmt.Println("\n=== Delivery Control Program Usage ===")
	fmt.Println("Ctrl+C: Exit program")
	fmt.Println("===========================\n")
}

// Event handlers
func onConnected() error {
	fmt.Println("Delivery: Connected")
	return nil
}

func onDisconnected() error {
	fmt.Println("Delivery: Disconnected")
	return nil
}

func onDelivery(data interface{}) error {
	jsonData, err := json.MarshalIndent(data, "", "  ")
	if err != nil {
		fmt.Printf("Data parsing error: %v\n", err)
		return err
	}
	fmt.Printf("Received Data: %s\n", string(jsonData))
	return nil
}

func onError(err interface{}) error {
	fmt.Printf("Delivery Error: %v\n", err)
	return nil
}

func sendPeriodicMessage(done chan bool) {
	ticker := time.NewTicker(3 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-done:
			return
		case <-ticker.C:
			currentTime := time.Now().Format("2006-01-02 15:04:05")
			message := map[string]interface{}{
				"timestamp": currentTime,
				"message":   fmt.Sprintf("Periodic Message - %s", currentTime),
			}

			err := deliveryClient.SendData(message)
			if err != nil {
				fmt.Printf("Error sending data: %v\n", err)
				continue
			}

			jsonMessage, _ := json.MarshalIndent(message, "", "  ")
			fmt.Printf("Sent Data: to %s\n%s\n", deliveryClient.PeerID, string(jsonMessage))
		}
	}
}

func main() {
	deliveryClient = delivery.NewENT02DeliveryAsync()

	// Set event handlers
	deliveryClient.OnConnected = onConnected
	deliveryClient.OnDisconnected = onDisconnected
	deliveryClient.OnDelivery = onDelivery
	deliveryClient.OnError = onError

	// Create and set ID
	myID := deliveryClient.CreateID()
	deliveryClient.SetID(myID)
	fmt.Printf("My ID: %s\n", myID)

	// Get peer ID input
	reader := bufio.NewReader(os.Stdin)
	fmt.Print("Enter peer ID: ")
	peerID, _ := reader.ReadString('\n')
	peerID = peerID[:len(peerID)-1] // Remove newline
	deliveryClient.SetPeerID(peerID)

	// Connect to server
	err := deliveryClient.RegisterDevice()
	if err != nil {
		fmt.Printf("Error connecting to server: %v\n", err)
		return
	}

	printUsage()

	// Setup signal handling for graceful shutdown
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	// Channel to stop periodic message goroutine
	done := make(chan bool)

	// Start periodic message sending
	go sendPeriodicMessage(done)

	// Wait for interrupt signal
	<-sigChan
	fmt.Println("\nExiting program...")

	// Cleanup
	done <- true
	close(done)
}
