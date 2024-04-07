package sg.edu.nus.iss.backend.service;

import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.amazonaws.AmazonServiceException;
import com.amazonaws.SdkClientException;
import com.amazonaws.services.s3.model.ObjectMetadata;

import jakarta.json.Json;
import jakarta.json.JsonObject;
import jakarta.json.JsonObjectBuilder;
import sg.edu.nus.iss.backend.model.User;
import sg.edu.nus.iss.backend.repository.ImageRepository;
import sg.edu.nus.iss.backend.repository.UserRepository;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private ImageRepository imgRepo;

    public JsonObject buildJsonObject(String key, String value) {
        JsonObjectBuilder b = Json.createObjectBuilder();
        b.add(key, value);
        return b.build();
    }

    public ResponseEntity<String> existingUser(String email) {
        boolean exist = userRepo.existingUser(email);
        if (exist) {
            JsonObject o = buildJsonObject("message", "user does not exists");
            return ResponseEntity.ok(o.toString());
        }
        JsonObject o = buildJsonObject("message", "existing user");
        return ResponseEntity.status(HttpStatusCode.valueOf(404)).body(o.toString());
    }

    public ResponseEntity<String> userVerification(String email, String password) {
        // email validation
        boolean exist = userRepo.existingUser(email);
        if (exist) {
            // password validation
            boolean valid = userRepo.checkPassword(email, password);
            if (valid) {
                // JsonObject o = buildJsonObject("message", "successfully logged in");
                // return ResponseEntity.ok(o.toString());
                JsonObject o = userRepo.findUserByEmail(email).get();
                return ResponseEntity.ok(o.toString());
            }

            JsonObject o = buildJsonObject("error", "failed to log in");
            return ResponseEntity.status(HttpStatusCode.valueOf(400)).body(o.toString());
        }
        // account does not exist
        JsonObject o = buildJsonObject("error", "user does not exists");
        return ResponseEntity.status(HttpStatusCode.valueOf(404)).body(o.toString());

    }

    public ResponseEntity<String> createNewUser(User user) {
        boolean added = userRepo.addNewUser(user);
        if (added) {

            String message = "successfully added user %s".formatted(user.getId());
            JsonObject o = buildJsonObject("message", message);

            return ResponseEntity.ok(o.toString());
        }

        JsonObject o = buildJsonObject("error", "new user not added");
        return ResponseEntity.status(HttpStatusCode.valueOf(400)).body(o.toString());
    }

    @Transactional(rollbackFor = { SdkClientException.class, AmazonServiceException.class, Exception.class })
    public void updateUserProfile(String id, String name, String email, MultipartFile image)
            throws SdkClientException, AmazonServiceException, Exception {
        InputStream is;
        try {
            // persist image to s3
            is = image.getInputStream();
            String contentType = image.getContentType();
            long length = image.getSize();
            String imageUrl = saveToS3(is, contentType, length);

            // update SQL database
            userRepo.updateUserDetails(id, name, email, imageUrl);

        } catch (IOException e) {

            e.printStackTrace();
        }
    }

    public JsonObject getUserByEmail(String email) {
        return userRepo.findUserByEmail(email).get();
    }

    public String saveToS3(InputStream is, String contentType, long length)
            throws SdkClientException, AmazonServiceException {
        ObjectMetadata metadata = new ObjectMetadata();
        Map<String, String> mydata = new HashMap<>();

        metadata.setContentType(contentType);
        metadata.setContentLength(length);
        metadata.setUserMetadata(mydata);

        String id = UUID.randomUUID().toString().substring(0, 8);

        return imgRepo.saveImageTo3T(id, metadata, is);
    }

    public ResponseEntity<String> changeUserPassword(User user, String newPassword) {
        // 1. check if current password is correct
        boolean valid = userRepo.checkPassword(user.getEmail(), user.getPassword());

        if (!valid) {
            JsonObject o = buildJsonObject("error", "incorrect password");
            return ResponseEntity.status(HttpStatusCode.valueOf(400)).body(o.toString());
        }

        // 2. change password - only proceed if current password is correct
        boolean updated = userRepo.changePassword(user.getEmail(), newPassword);
        if (!updated) {
            JsonObject o = buildJsonObject("error", "error changing password");
            return ResponseEntity.status(HttpStatusCode.valueOf(400)).body(o.toString());
        }

        JsonObject o = buildJsonObject("message", "password changed successfully");
        return ResponseEntity.ok().body(o.toString());
    }

}
