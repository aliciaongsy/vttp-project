package sg.edu.nus.iss.backend.repository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.rowset.SqlRowSet;
import org.springframework.stereotype.Repository;

import sg.edu.nus.iss.backend.PassBasedEnc;
import sg.edu.nus.iss.backend.model.User;

@Repository
public class UserRepository {
    
    @Autowired
    private JdbcTemplate template;

    public boolean findUserByEmail(String email){
        SqlRowSet rs = template.queryForRowSet(Queries.SQL_FIND_USER_BY_EMAIL, email);
        return rs.first();
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
}
