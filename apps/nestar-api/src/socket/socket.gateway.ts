import { Logger } from '@nestjs/common';
import { OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'ws';
import * as WebSocket from "ws"

interface MessagePayload {
	exent: string;
	text: string;
}

interface InfoPayload {
	exent: string;
	totalClients: number;
}

@WebSocketGateway({ transports: ['websocket'], secure: false })
export class SocketGateway implements OnGatewayInit {
	private logger: Logger = new Logger('SocketEventGateway');
	private summaryClient: number = 0;

	@WebSocketServer()
	server: Server;

	public afterInit(server: any) {
		this.logger.verbose(`=== Client cinnected total: ${this.summaryClient} ==`);
	}

	handleConnection(client: WebSocket, ...args: any[]) {
		this.summaryClient++;
		this.logger.verbose(`=== Client connected total: ${this.summaryClient} ==-=`);

		const infoMsg: InfoPayload = {
			exent: 'info',
			totalClients: this.summaryClient,
		}

		this.emitMessage(infoMsg);
	}

	handleDisconnect(client: WebSocket) {
		this.summaryClient--;
		this.logger.verbose(`=== Client disconnected left total: ${this.summaryClient} = = `);
	}

	@SubscribeMessage('message')
	public async handleMessage(client: WebSocket, payload: any): Promise<void> {
		const newMessage: MessagePayload = {
			exent: 'message',
			text: payload,
		}
		this.logger.verbose(`Received message: ${payload}`);
	}

	private broadcastMessage(sender: WebSocket, message:InfoPayload |  MessagePayload) {
		this.server.clients.forEach((client: WebSocket) => {
			if (client !== sender && client.readyState === WebSocket.OPEN) {
				client.send(JSON.stringify(message));
			}
		});
	}

	private emitMessage(message: InfoPayload | MessagePayload) {
		this.server.clients.forEach((client: WebSocket) => {
			if (client.readyState === WebSocket.OPEN) {
				client.send(JSON.stringify(message));
			}
		});
	}

}
