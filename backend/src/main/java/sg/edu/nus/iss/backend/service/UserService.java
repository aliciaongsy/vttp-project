package sg.edu.nus.iss.backend.service;

import org.jvnet.hk2.annotations.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;

import jakarta.json.Json;
import jakarta.json.JsonObject;
import jakarta.json.JsonObjectBuilder;
import sg.edu.nus.iss.backend.model.User;
import sg.edu.nus.iss.backend.repository.UserRepository;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepo;

    public JsonObject buildJsonObject(String key, String value){
        JsonObjectBuilder b = Json.createObjectBuilder();
        b.add(key, value);
        return b.build();
    }

    public ResponseEntity<String> findUserByEmail(String email){
        boolean exist = userRepo.existingUser(email);
        if (exist){
            JsonObject o = userRepo.findUserByEmail(email).get();
            return ResponseEntity.ok(o.toString());
        }
        
        JsonObject o = buildJsonObject("message", "user does not exists");
        return ResponseEntity.status(HttpStatusCode.valueOf(404)).body(o.toString());
    }

    public ResponseEntity<String> userVerification(String email, String password){
        // email validation is done in frontend
        boolean valid = userRepo.checkPassword(email, password);
        if (valid){
            JsonObject o = buildJsonObject("message", "successfully logged in");
            return ResponseEntity.ok(o.toString());
        }
        
        JsonObject o = buildJsonObject("error", "failed to log in");
        return ResponseEntity.status(HttpStatusCode.valueOf(404)).body(o.toString());
    }

    public ResponseEntity<String> createNewUser(User user){
        boolean added = userRepo.addNewUser(user);
        if (added){

            String message = "successfully added user %s".formatted(user.getId());
            JsonObject o = buildJsonObject("message", message);

            return ResponseEntity.ok(o.toString());
        }

        JsonObject o = buildJsonObject("error", "new user not added");
        return ResponseEntity.status(HttpStatusCode.valueOf(404)).body(o.toString());
    }

}
