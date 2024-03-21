package sg.edu.nus.iss.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import sg.edu.nus.iss.backend.repository.UserRepository;

@Service
public class TelegramService {

    @Autowired
    private UserRepository userRepo;
    
    public boolean checkUserExistInDatabase(String email){
        System.out.println("in telegram service");
        return userRepo.existingUser(email);
    }
}
