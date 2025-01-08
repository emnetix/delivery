import asyncio
import sys
import os
import json
from datetime import datetime

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from ent02client.ent02delivery_async import ENT02DeliveryAsync

delivery = None

def print_usage():
    """Function to print usage instructions"""
    print("\n=== Delivery Control Program Usage ===")
    print("Ctrl+C: Exit program")
    print("===========================\n")

# Event handler functions
async def onConnected():
    print('Delivery: Connected')

async def onDisconnected():
    print('Delivery: Disconnected')

async def onDelivery(data):
    try:
        if isinstance(data, dict):
            print(f'Received Data: {json.dumps(data, indent=2, ensure_ascii=False)}')
        else:
            json_data = json.loads(data)
            print(f'Received Data: {json.dumps(json_data, indent=2, ensure_ascii=False)}')
    except Exception as e:
        print(f'Data parsing error: {e}')

async def onError(error: str):
    print(f'Delivery Error: {error}')

async def send_periodic_message():
    """Function to send messages with timestamp every 3 seconds"""
    while True:
        current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        message = {
            "timestamp": current_time,
            "message": f"Periodic Message - {current_time}"
        }
        await delivery.send_data(message)
        print(f'Sent Data: to {delivery.peer_id} \n {json.dumps(message, indent=2, ensure_ascii=False)}')
        await asyncio.sleep(3)

async def main():
    global delivery
    delivery = ENT02DeliveryAsync()

    # Set event handlers
    delivery.on_connected = onConnected
    delivery.on_disconnected = onDisconnected
    delivery.on_delivery = onDelivery
    delivery.on_error = onError

    # Create and set ID
    my_id = await delivery.create_id()
    await delivery.set_id(my_id)
    print(f'My ID: {my_id}')
    
    # Get peer ID input
    peer_id = input("Enter peer ID: ")
    await delivery.set_peer_id(peer_id)
    
    # Connect to server
    await delivery.register_device()
    
    print_usage()

    try:
        # Create message sending task
        message_task = asyncio.create_task(send_periodic_message())
        
        # Simplified main loop
        while True:
            await asyncio.sleep(1)
            
    except KeyboardInterrupt:
        print("\nExiting program...")
    finally:
        if 'message_task' in locals():
            message_task.cancel()

if __name__ == "__main__":
    asyncio.run(main())