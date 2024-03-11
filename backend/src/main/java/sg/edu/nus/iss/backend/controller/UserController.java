package sg.edu.nus.iss.backend.controller;

import java.io.StringReader;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import jakarta.json.Json;
import jakarta.json.JsonObject;
import jakarta.json.JsonReader;
import sg.edu.nus.iss.backend.model.User;
import sg.edu.nus.iss.backend.service.UserService;

@Controller
@RequestMapping(path = "/api")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userSvc;

    @GetMapping(path = "/user/{email}")
    @ResponseBody
    public ResponseEntity<String> checkUserExist(@PathVariable String email) {
        return userSvc.findUserByEmail(email);
    }

    @GetMapping(path = "/login")
    @ResponseBody
    public ResponseEntity<String> login(@RequestParam String email, @RequestParam String password) {
        return userSvc.userVerification(email, password);
    }

    @PostMapping(path = "/register", consumes = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public ResponseEntity<String> createUser(@RequestBody String payload) {

        JsonReader reader = Json.createReader(new StringReader(payload));
        JsonObject u = reader.readObject();

        User user = new User();
        user.setName(u.getString("name"));
        user.setEmail(u.getString("email"));
        user.setPassword(u.getString("password"));

        return userSvc.createNewUser(user);
    }
}
