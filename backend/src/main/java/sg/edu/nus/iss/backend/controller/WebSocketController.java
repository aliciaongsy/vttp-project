package sg.edu.nus.iss.backend.controller;

import java.io.StringReader;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;

import jakarta.json.Json;
import jakarta.json.JsonObject;
import jakarta.json.JsonReader;
import sg.edu.nus.iss.backend.model.ChatMessage;
import sg.edu.nus.iss.backend.model.ChatRoom;
import sg.edu.nus.iss.backend.service.ChatService;

@Controller
@CrossOrigin(origins = "*")
public class WebSocketController {

    @Autowired
    private ChatService chatSvc;

    // retrieving chat list and data
    @GetMapping("/api/{id}/chats")
    @ResponseBody
    public ResponseEntity<String> getAllChats(@PathVariable String id) {
        return chatSvc.getAllChats(id);
    }

    @PostMapping("/api/chat/join/{roomId}")
    @ResponseBody
    public ResponseEntity<String> joinChatRoom(@PathVariable String roomId, @RequestBody String id) {
        return chatSvc.joinRoom(id, roomId);
    }

    @PostMapping("/api/chat/create")
    @ResponseBody
    public ResponseEntity<String> createChatRoom(@RequestBody String payload) {
        System.out.println("enter post mapping");
        JsonReader reader = Json.createReader(new StringReader(payload));
        JsonObject o = reader.readObject();

        ChatRoom room = new ChatRoom();
        room.setOwner(o.getString("owner"));
        room.setName(o.getString("name"));
        room.setType(o.getString("type"));

        return chatSvc.createRoom(room.getOwner(), room);
    }

    // web socket
    @MessageMapping("/chat/sendmessage/{roomId}")
    @SendTo("/topic/{roomId}") // messages sent to @MessageMapping endpoint will be dispatched to this @SendTo endpoint
    public ChatMessage sendMessage(@DestinationVariable String roomId, @Payload ChatMessage chatMessage) {
        System.out.println(chatMessage.getContent());
        return chatMessage;
    }

    @MessageMapping("/chat/adduser/{roomId}")
    @SendTo("/topic/{roomId}")
    public ChatMessage addUser(@DestinationVariable String roomId, @Payload ChatMessage chatMessage,
            SimpMessageHeaderAccessor headerAccessor) {
        // add username in websocket session
        headerAccessor.getSessionAttributes().put("username", chatMessage.getSender());
        return chatMessage;
    }

}
