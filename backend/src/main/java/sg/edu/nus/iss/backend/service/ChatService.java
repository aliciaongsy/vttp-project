package sg.edu.nus.iss.backend.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.json.Json;
import jakarta.json.JsonArrayBuilder;
import jakarta.json.JsonObject;
import jakarta.json.JsonObjectBuilder;
import sg.edu.nus.iss.backend.exception.ChatListException;
import sg.edu.nus.iss.backend.exception.ChatRoomException;
import sg.edu.nus.iss.backend.model.ChatMessage;
import sg.edu.nus.iss.backend.model.ChatRoom;
import sg.edu.nus.iss.backend.repository.ChatRepository;

@Service
public class ChatService {

    @Autowired
    private ChatRepository chatRepo;

    public JsonObject buildJsonObject(String key, String value) {
        JsonObjectBuilder b = Json.createObjectBuilder();
        b.add(key, value);
        return b.build();
    }

    public ResponseEntity<String> getChatRoomDetails(String roomId) {
        ChatRoom room = chatRepo.getDetailsByRoomId(roomId);

        if (room == null){
            JsonObject o = buildJsonObject("error", "chat room does not exist");
            return ResponseEntity.badRequest().body(o.toString());
        }
        return ResponseEntity.ok(room.toJson(room).toString());
    }

    public ResponseEntity<String> checkExistingChatroom(String roomId) {
        ChatRoom room = chatRepo.getDetailsByRoomId(roomId);

        if (room == null){
            JsonObject o = buildJsonObject("error", "chat room does not exist");
            return ResponseEntity.badRequest().body(o.toString());
        }
        return ResponseEntity.ok(room.toJson(room).toString());
    }

    public ResponseEntity<String> getAllChats(String id) {
        List<ChatRoom> chats = chatRepo.getAllChats(id);
        if (chats.isEmpty()) {
            JsonArrayBuilder b = Json.createArrayBuilder();
            return ResponseEntity.ok(b.build().toString());
        }
        JsonArrayBuilder b = Json.createArrayBuilder();
        chats.forEach(c -> b.add(c.toJson2(c)));
        return ResponseEntity.ok(b.build().toString());
    }

    public ResponseEntity<String> checkIfUserJoined(String id, String roomId){
        boolean joined = chatRepo.checkIfUserJoined(id, roomId);

        if (joined) {
            JsonObject o = buildJsonObject("error", "user is already in the chat room");
            return ResponseEntity.status(HttpStatusCode.valueOf(400)).body(o.toString());
        }
        JsonObject o = buildJsonObject("message", "user is not in the chat room");
        return ResponseEntity.ok(o.toString());
    }

    @Transactional(rollbackFor = { ChatRoomException.class, ChatListException.class })
    public void joinRoom(String id, String name, String roomId) throws ChatListException, ChatRoomException {
        chatRepo.addNewUser(roomId, id, name);
        chatRepo.joinChatRoom(id, roomId);
    }

    @Transactional(rollbackFor = { ChatRoomException.class, ChatListException.class })
    public void createRoom(String id, ChatRoom room) throws ChatRoomException, ChatListException {
        chatRepo.addChatRoom(id, room);
        chatRepo.createChatRoom(id, room);
    }

    public ResponseEntity<String> getPublicChats(String name) {
        List<ChatRoom> chats = chatRepo.getAllPublicChatRoom(name);
        if (chats.isEmpty()) {
            JsonArrayBuilder b = Json.createArrayBuilder();
            return ResponseEntity.ok(b.build().toString());
        }
        JsonArrayBuilder b = Json.createArrayBuilder();
        chats.forEach(c -> b.add(c.toJson2(c)));
        return ResponseEntity.ok(b.build().toString());
    }

    @Transactional(rollbackFor = { ChatRoomException.class, ChatListException.class })
    public void leaveRoom(String id, String roomId, String name) throws ChatRoomException, ChatListException {
        chatRepo.removeUserFromChatRoom(roomId, id, name);
        chatRepo.leaveChatRoom(id, roomId);
    }

    // --- chat messages ---
    public ResponseEntity<String> getAllChatMessages(String roomId) {
        List<ChatMessage> messages = chatRepo.getAllMessagesByRoomId(roomId);

        if (messages.isEmpty()) {
            JsonArrayBuilder b = Json.createArrayBuilder();
            return ResponseEntity.ok(b.build().toString());
        }
        JsonArrayBuilder b = Json.createArrayBuilder();
        messages.forEach(m -> b.add(m.toJson(m)));
        return ResponseEntity.ok(b.build().toString());
    }

    public ResponseEntity<String> saveMessages(String roomId, ChatMessage message) {
        boolean added = chatRepo.saveMessages(roomId, message);

        if (added) {
            JsonObject o = buildJsonObject("message", "successfully added messages");
            return ResponseEntity.ok(o.toString());
        }
        JsonObject o = buildJsonObject("error", "error adding messages");
        return ResponseEntity.status(HttpStatusCode.valueOf(400)).body(o.toString());
    }
}
