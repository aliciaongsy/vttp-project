package sg.edu.nus.iss.backend.repository;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.rowset.SqlRowSet;
import org.springframework.stereotype.Repository;

import jakarta.json.JsonObject;
import sg.edu.nus.iss.backend.PassBasedEnc;
import sg.edu.nus.iss.backend.model.User;

@Repository
public class UserRepository {
    
    @Autowired
    private JdbcTemplate template;

    public boolean existingUser(String email){
        SqlRowSet rs = template.queryForRowSet(Queries.SQL_FIND_USER_BY_EMAIL, email);
        return rs.first();
    }

    public Optional<JsonObject> findUserByEmail(String email){
        SqlRowSet rs = template.queryForRowSet(Queries.SQL_FIND_USER_BY_EMAIL, email);
        if(rs.first()){
            User user = new User();
            return Optional.ofNullable(user.getJsonDetails(rs));
        }
        return Optional.empty();
        
    }

    public boolean addNewUser(User user){
        String password = user.getPassword();
        /* generates the Salt value. It can be stored in a database. */
        String saltvalue = PassBasedEnc.getSaltvalue(30);

        /* generates an encrypted password. It can be stored in a database. */
        String encryptedpassword = PassBasedEnc.generateSecurePassword(password, saltvalue);

        return template.update(Queries.SQL_ADD_USER, user.getId(), user.getName(), user.getEmail(), encryptedpassword, saltvalue) > 0;
    }

    public boolean checkPassword(String email, String password) {

        SqlRowSet rs = template.queryForRowSet(Queries.SQL_FIND_USER_BY_EMAIL, email);

        String encryptedpassword = "";
        String saltvalue = "";
        while(rs.next()){
            encryptedpassword = rs.getString("password");
            saltvalue = rs.getString("salt");
        }
        boolean status = PassBasedEnc.verifyUserPassword(password, encryptedpassword, saltvalue);
        if (status == true) {
            System.out.println("password matched!!");
            return true;
        }
        System.out.println("password mismatched");
        return false;

    }

    public String getUserIdByChatid(String chatid){
        SqlRowSet rs = template.queryForRowSet(Queries.SQL_GET_USERID_BY_CHATID, chatid);
        if (rs.first()){
            return rs.getString("id");
        }
        return "";
    }

    public boolean checkEmailAndId(String email, String id){
        SqlRowSet rs = template.queryForRowSet(Queries.SQL_FIND_USER_BY_EMAIL_AND_ID, email, id);
        return rs.first();
    }

    public boolean checkIfAccountIsLinked(String chatid){
        SqlRowSet rs = template.queryForRowSet(Queries.SQL_FIND_USER_BY_CHATID, chatid);
        return rs.first();
    }

    public boolean addTelegramDetails(String chatid, String username, String email, String id){
        return template.update(Queries.SQL_ADD_TELEGRAM_ACCOUNT, chatid, username, email, id) > 0;
    }
}
