package sg.edu.nus.iss.backend.repository;

import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;

import org.bson.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationOperation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.data.mongodb.core.aggregation.MatchOperation;
import org.springframework.data.mongodb.core.aggregation.ProjectionOperation;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Repository;

import com.mongodb.client.result.DeleteResult;
import com.mongodb.client.result.UpdateResult;

import sg.edu.nus.iss.backend.exception.ChatListException;
import sg.edu.nus.iss.backend.exception.ChatRoomException;
import sg.edu.nus.iss.backend.model.ChatMessage;
import sg.edu.nus.iss.backend.model.ChatRoom;

@Repository
public class ChatRepository {

    @Autowired
    private MongoTemplate template;

    // --- chat room ---
    public ChatRoom getDetailsByRoomId(String roomId) {

        System.out.println(roomId);

        Criteria criteria = Criteria.where("roomId").is(roomId);
        Query query = new Query(criteria);

        List<Document> docs = template.find(query, Document.class, "chatroom");

        if (docs.isEmpty()) {
            return null;
        }

        ChatRoom room = new ChatRoom();
        room = room.docToChatRoom(docs.getFirst());
        return room;
    }

    /*  db.chatlist.aggregate([
    {
        $match: {
            id: "d73726d8"
        }
    },
    {
        $unwind: "$chats"
    },
    {
        $project: {
            _id: 0,
            roomId: "$chats.roomId",
            owner:"$chats.owner",
            name:"$chats.name",
            type:"$chats.type",
        }
    }
    ]);*/
    public List<ChatRoom> getAllChats(String id) {

        MatchOperation matchOps = Aggregation.match(Criteria.where("id").is(id));

        AggregationOperation unwindOps = Aggregation.unwind("chats");

        ProjectionOperation projectOps = Aggregation.project()
                .andExclude("_id")
                .and("chats.roomId").as("roomId")
                .and("chats.ownerId").as("ownerId")
                .and("chats.ownerName").as("ownerName")
                .and("chats.name").as("name")
                .and("chats.usernames").as("usernames")
                .and("chats.users").as("users")
                .and("chats.userCount").as("userCount")
                .and("chats.createDate").as("createDate")
                .and("chats.type").as("type");

        Aggregation pipeline = Aggregation.newAggregation(matchOps, unwindOps, projectOps);

        AggregationResults<Document> results = template.aggregate(pipeline, "chatlist", Document.class);

        List<Document> docs = results.getMappedResults();

        if (docs.isEmpty()) {
            return new LinkedList<>();
        }

        List<ChatRoom> rooms = new LinkedList<>();
        docs.forEach(d -> {
            System.out.println(d.toJson());
            ChatRoom c = new ChatRoom();
            c = c.docToChatRoom2(d);
            rooms.add(c);
        });

        return rooms;
    }

    public void addChatRoom(String id, ChatRoom room) throws ChatRoomException {
        // add into collection that contains all chatroom details
        Document insert = template.insert(room.toDoc(room), "chatroom");

        if (insert.isEmpty()) {
            throw new ChatRoomException("error adding chatroom details into chatroom collection");
        }
    }

    public void createChatRoom(String id, ChatRoom room) throws ChatListException {

        Criteria criteria = Criteria.where("id").is(id);
        Query query = new Query(criteria);

        List<Document> docs = template.find(query, Document.class, "chatlist");

        if (docs.isEmpty()) {
            List<Document> chats = new ArrayList<>();
            chats.add(room.toDoc2(room));

            Document doc = new Document();
            doc.put("id", id);
            doc.put("chats", chats);
            Document insert = template.insert(doc, "chatlist");

            if (insert.isEmpty()) {
                throw new ChatListException("error adding chatroom details into chatlist collection");
            }

        } else {
            Update updateOps = new Update().push("chats").value(room.toDoc2(room));

            UpdateResult updateResult = template.updateFirst(query, updateOps, Document.class, "chatlist");

            if (updateResult.getModifiedCount() == 0) {
                throw new ChatListException("error adding chatroom details into chatlist collection");
            }
        }
    }

    public void addNewUser(String roomId, String id, String name) throws ChatListException {
        Criteria criteria = Criteria.where("roomId").is(roomId);
        Query query = new Query(criteria);

        Update updateOps = new Update().push("users").value(id)
            .push("usernames").value(name)
            .inc("userCount", 1);

        UpdateResult updateResult = template.updateFirst(query, updateOps, Document.class, "chatroom");

        if (updateResult.getModifiedCount() == 0) {
            throw new ChatListException("error adding chatroom details into chatlist collection");
        }
    }

    /* db.chatlist.find({
        id: "d73726d8",
        "chats": {"$elemMatch": {"roomId": "811cc6"}}
    }); */        
    public boolean checkIfUserJoined(String id, String roomId){
        Criteria criteria = Criteria.where("id").is(id)
                    .andOperator(Criteria.where("chats").elemMatch(Criteria.where("roomId").is(roomId)));

        Query query = new Query(criteria);

        List<Document> docs = template.find(query, Document.class, "chatlist");

        return !(docs.isEmpty());
    }

    public void joinChatRoom(String id, String roomId) throws ChatListException, ChatRoomException {

        // chat if it is a valid room id
        ChatRoom room = getDetailsByRoomId(roomId);
        if (room == null) {
            throw new ChatRoomException("chatroom does not exist");
        }

        Criteria criteria = Criteria.where("id").is(id);
        Query query = new Query(criteria);

        List<Document> docs = template.find(query, Document.class, "chatlist");

        if (docs.isEmpty()) {
            List<Document> chats = new ArrayList<>();
            chats.add(room.toDoc2(room));

            Document doc = new Document();
            doc.put("id", id);
            doc.put("chats", chats);
            Document insert = template.insert(doc, "chatlist");
            if (insert.isEmpty()) {
                throw new ChatListException("error adding chatroom details into chatlist collection");
            }
        }
        else{
            // check if user has already joined the chat room
            boolean joined = checkIfUserJoined(id, roomId);

            // user is already in the chat room
            if (joined) {
                throw new ChatListException("user is already in the chat room");
            }

            Update updateOps = new Update().push("chats").value(room.toDoc2(room));

            UpdateResult updateResult = template.updateFirst(query, updateOps, Document.class, "chatlist");

            if (updateResult.getModifiedCount() == 0) {
                throw new ChatListException("error adding chatroom details into chatlist collection");
            }
        }
    }

    /*db.chatroom.updateOne(
        {
            roomId: "d73726"
        },
        {
            $pull:{
                { users: "12345678" }
            },
            $inc: { userCount: -1 }
        }
    ); */
    public void removeUserFromChatRoom(String roomId, String id, String name) throws ChatRoomException{
        // check if user is owner
        Criteria c = Criteria.where("roomId").is(roomId).andOperator(Criteria.where("ownerId").is(id));

        Query q = new Query(c);

        Criteria criteria = Criteria.where("roomId").is(roomId);

        Query query = new Query(criteria);

        List<Document> doc = template.find(q, Document.class, "chatroom");
        if (!doc.isEmpty()){
            // if there is currently only one person in the chat room -> delete chatroom after leaving
            if(doc.getFirst().getList("usernames", String.class).size()<2){
                // delete chat room
                DeleteResult delete = template.remove(q, "chatroom");

                DeleteResult deleteMsg = template.remove(query, "chatmessage");

                if (delete.getDeletedCount() == 0 || deleteMsg.getDeletedCount() == 0){
                    throw new ChatRoomException("error deleting chat room");
                }

                return;
            }

            System.out.println("transfering ownership");
            // transfer ownership to next user
            String transferName = doc.getFirst().getList("usernames", String.class).get(1);
            String transferId = doc.getFirst().getList("users", String.class).get(1);

            Update updateOps = new Update()
                .set("ownerName", transferName)
                .set("ownerId", transferId)
                .pull("users", id)
                .pull("usernames", name)
                .inc("userCount", -1);

            UpdateResult update = template.updateFirst(q, updateOps, "chatroom");

            if (update.getModifiedCount() == 0){
                throw new ChatRoomException("error transferring ownership");
            }

            return;
        }

        Update updateOps = new Update()
            .pull("users", id)
            .pull("usernames", name)
            .inc("userCount", -1);
        
        UpdateResult update = template.updateFirst(query, updateOps, "chatroom");

        if (update.getModifiedCount() == 0){
            throw new ChatRoomException("error removing user from chatroom");
        }
    }

    /* db.chatlist.updateOne(
        {
            id: "d73726d8",
        },
        {
            $pull:{
                chats:{
                    roomId: "1ca6ea"
                }
            }
        }
    ); */
    public void leaveChatRoom(String id, String roomId) throws ChatListException{
        Criteria criteria = Criteria.where("id").is(id);

        Query query = new Query(criteria);

        Update updateOps = new Update()
            .pull("chats", new Query(Criteria.where("roomId").is(roomId)));
        
        UpdateResult update = template.updateFirst(query, updateOps, "chatlist");

        if (update.getModifiedCount() == 0){
            throw new ChatListException("error removing chatroom details from chatlist");
        }
    }

    /* db.chatroom.aggregate([
    {
        $match: {
            name: {$regex: "Chat", $options: "i"},
            type: "Public"
        }
    },
    {
        $project: {
            _id:0,
            roomId: 1,
            name: 1
        }
    }
    ]);*/
    // search for public chatroom by name
    public List<ChatRoom> getAllPublicChatRoom(String name){
        MatchOperation matchOps = Aggregation.match(Criteria.where("name").regex(name, "i"));

        ProjectionOperation projectOps = Aggregation.project()
                .andExclude("_id")
                .andInclude("roomId")
                .andInclude("name");

        Aggregation pipeline = Aggregation.newAggregation(matchOps, projectOps); 

        AggregationResults<Document> results = template.aggregate(pipeline, "chatroom", Document.class);

        List<Document> docs = results.getMappedResults();

        if(docs.isEmpty()){
            return new LinkedList<>();
        }

        List<ChatRoom> rooms = new LinkedList<>();
        docs.forEach(d -> {
        System.out.println(d.toJson());
        ChatRoom c = new ChatRoom();
        c = c.docToChatRoom2(d);
        rooms.add(c);
        });

        return rooms;

    }

    // --- chat messages ---
    /*  db.chatmessage.aggregate([
    {
        $match: {
            roomId: "d73726d8"
        }
    },
    {
        $unwind: "$messages"
    },
    {
        $project: {
            _id: 0,
            content: "$messages.content",
            sender: "$messages.sender",
            type: "$messages.type",
            timestamp: "$messages.timestamp"
        }
    }
    ]);*/
    public List<ChatMessage> getAllMessagesByRoomId(String roomId) {

        MatchOperation matchOps = Aggregation.match(Criteria.where("roomId").is(roomId));

        AggregationOperation unwindOps = Aggregation.unwind("messages");

        ProjectionOperation projectOps = Aggregation.project()
                .andExclude("_id")
                .and("messages.content").as("content")
                .and("messages.sender").as("sender")
                .and("messages.type").as("type")
                .and("messages.timestamp").as("timestamp");

        Aggregation pipeline = Aggregation.newAggregation(matchOps, unwindOps, projectOps);

        AggregationResults<Document> results = template.aggregate(pipeline, "chatmessage", Document.class);

        List<Document> docs = results.getMappedResults();

        if (docs.isEmpty()) {
            return new LinkedList<>();
        }

        List<ChatMessage> messages = new LinkedList<>();
        docs.forEach(d -> {
            ChatMessage m = new ChatMessage();
            m = m.docToChatMessage(d);
            messages.add(m);
        });

        return messages;
    }

    public boolean saveMessages(String roomId, ChatMessage message) {
        Criteria criteria = Criteria.where("roomId").is(roomId);
        Query query = new Query(criteria);

        List<Document> docs = template.find(query, Document.class, "chatmessage");

        if (docs.isEmpty()) {
            List<Document> messages = new ArrayList<>();
            messages.add(message.toDoc(message));

            Document doc = new Document();
            doc.put("roomId", roomId);
            doc.put("messages", messages);
            Document insert = template.insert(doc, "chatmessage");
            return !(insert.isEmpty());
        }

        Update updateOps = new Update().push("messages").value(message.toDoc(message));

        UpdateResult updateResult = template.updateFirst(query, updateOps, Document.class, "chatmessage");

        return updateResult.getModifiedCount() > 0;
    }
}
