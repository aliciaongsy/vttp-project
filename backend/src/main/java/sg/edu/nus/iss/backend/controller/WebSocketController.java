package sg.edu.nus.iss.backend.controller;

import java.io.StringReader;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import jakarta.json.Json;
import jakarta.json.JsonObject;
import jakarta.json.JsonObjectBuilder;
import jakarta.json.JsonReader;
import sg.edu.nus.iss.backend.exception.ChatListException;
import sg.edu.nus.iss.backend.exception.ChatRoomException;
import sg.edu.nus.iss.backend.model.ChatMessage;
import sg.edu.nus.iss.backend.model.ChatRoom;
import sg.edu.nus.iss.backend.service.ChatService;

@Controller
@CrossOrigin(origins = "*")
public class WebSocketController {

    @Autowired
    private ChatService chatSvc;

    // --- chat list and data ---
    @GetMapping("/api/{id}/chats")
    @ResponseBody
    public ResponseEntity<String> getAllChats(@PathVariable String id) {
        return chatSvc.getAllChats(id);
    }

    @GetMapping("/api/chat/details/{roomId}")
    @ResponseBody
    public ResponseEntity<String> getChatRoomDetails(@PathVariable String roomId) {
        return chatSvc.getChatRoomDetails(roomId);
    }

    @PostMapping("/api/chat/join/{roomId}")
    @ResponseBody
    public ResponseEntity<String> joinChatRoom(@PathVariable String roomId, @RequestBody String payload) {
        JsonReader reader = Json.createReader(new StringReader(payload));
        JsonObject o = reader.readObject();
        String name = o.getString("name");
        String id = o.getString("id");
        try {
            chatSvc.joinRoom(id, name, roomId);
        } catch (ChatListException e) {

            e.printStackTrace();
            JsonObjectBuilder b = Json.createObjectBuilder();
            b.add("error", e.getMessage());
            return ResponseEntity.status(HttpStatusCode.valueOf(400)).body(b.build().toString());

        } catch (ChatRoomException e) {

            e.printStackTrace();
            JsonObjectBuilder b = Json.createObjectBuilder();
            b.add("error", e.getMessage());
            return ResponseEntity.status(HttpStatusCode.valueOf(400)).body(b.build().toString());

        }

        JsonObjectBuilder b = Json.createObjectBuilder();
        b.add("message", "successfully joined new chat room");
        return ResponseEntity.ok().body(b.build().toString());
    }

    @DeleteMapping("/api/{id}/chat/leave/{roomId}")
    @ResponseBody
    public ResponseEntity<String> leaveChatRoom(@PathVariable String id, @PathVariable String roomId) {
        try {
            chatSvc.leaveRoom(id, roomId);
        } catch (ChatRoomException e) {

            e.printStackTrace();
            JsonObjectBuilder b = Json.createObjectBuilder();
            b.add("error", e.getMessage());
            return ResponseEntity.status(HttpStatusCode.valueOf(400)).body(b.build().toString());

        } catch (ChatListException e) {

            e.printStackTrace();
            JsonObjectBuilder b = Json.createObjectBuilder();
            b.add("error", e.getMessage());
            return ResponseEntity.status(HttpStatusCode.valueOf(400)).body(b.build().toString());

        }

        JsonObjectBuilder b = Json.createObjectBuilder();
        b.add("message", "successfully left chat room");
        return ResponseEntity.ok().body(b.build().toString());
    }

    @PostMapping("/api/chat/create")
    @ResponseBody
    public ResponseEntity<String> createChatRoom(@RequestBody String payload) {
        System.out.println("enter post mapping");
        JsonReader reader = Json.createReader(new StringReader(payload));
        JsonObject o = reader.readObject();

        ChatRoom room = new ChatRoom();
        room = room.jsonToChatRoom(o);

        try {
            chatSvc.createRoom(room.getOwnerId(), room);
        } catch (ChatRoomException e) {

            e.printStackTrace();
            JsonObjectBuilder b = Json.createObjectBuilder();
            b.add("error", e.getMessage());
            return ResponseEntity.status(HttpStatusCode.valueOf(400)).body(b.build().toString());

        } catch (ChatListException e) {

            e.printStackTrace();
            JsonObjectBuilder b = Json.createObjectBuilder();
            b.add("error", e.getMessage());
            return ResponseEntity.status(HttpStatusCode.valueOf(400)).body(b.build().toString());

        }

        JsonObjectBuilder b = Json.createObjectBuilder();
        b.add("message", "successfully created new chat room");
        return ResponseEntity.ok().body(b.build().toString());
    }

    @GetMapping("/api/chats/public")
    @ResponseBody
    public ResponseEntity<String> getPublicChats(@RequestParam String name) {
        return chatSvc.getPublicChats(name);
    }

    // --- websocket ---
    // sending message
    @MessageMapping("/chat/sendmessage/{roomId}")
    @SendTo("/topic/{roomId}") // messages sent to @MessageMapping endpoint will be dispatched to this @SendTo
                               // endpoint
    public ChatMessage sendMessage(@DestinationVariable String roomId, @Payload ChatMessage chatMessage) {
        System.out.println(chatMessage.getContent());

        chatSvc.saveMessages(roomId, chatMessage);
        // persist messages into db
        return chatMessage;
    }

    // new user join the chat
    @MessageMapping("/chat/adduser/{roomId}")
    @SendTo("/topic/{roomId}")
    public ChatMessage addUser(@DestinationVariable String roomId, @Payload ChatMessage chatMessage,
            SimpMessageHeaderAccessor headerAccessor) {
        // add username in websocket session
        headerAccessor.getSessionAttributes().put("username", chatMessage.getSender());
        return chatMessage;
    }

    @GetMapping("/api/chat/messages/{roomId}")
    @ResponseBody
    public ResponseEntity<String> getChatRoomMessages(@PathVariable String roomId) {
        return chatSvc.getAllChatMessages(roomId);
    }

}
