package sg.edu.nus.iss.backend.model;

import java.util.UUID;

import org.springframework.jdbc.support.rowset.SqlRowSet;

import jakarta.json.Json;
import jakarta.json.JsonObject;
import jakarta.json.JsonObjectBuilder;

public class User {
    
    private String id;
    private String name;
    private String email;
    private String password;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public User(){
        this.id = UUID.randomUUID().toString().substring(0,8);
    }

    public User(String name, String email, String password){
        this.name = name;
        this.email = email;
        this.password = password;
        this.id = UUID.randomUUID().toString().substring(0,8);
    }

    public JsonObject getJsonDetails(SqlRowSet rs){
        JsonObjectBuilder b = Json.createObjectBuilder();
        return b.add("id", rs.getString("id"))
            .add("name", rs.getString("name"))
            .add("email", rs.getString("email"))
            .build();
    }
}
