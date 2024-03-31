package sg.edu.nus.iss.backend.exception;

public class ChatRoomException extends Exception {
    public ChatRoomException(){
        super();
    }

    public ChatRoomException(String message){
        super(message);
    }
}
