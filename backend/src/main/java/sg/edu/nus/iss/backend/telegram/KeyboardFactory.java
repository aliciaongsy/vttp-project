package sg.edu.nus.iss.backend.telegram;

import java.util.List;

import org.telegram.telegrambots.meta.api.objects.replykeyboard.ReplyKeyboard;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.ReplyKeyboardMarkup;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.KeyboardRow;

public class KeyboardFactory {
    public static ReplyKeyboard linkAccount() {
        KeyboardRow row = new KeyboardRow();
        row.add("/linkaccount");
        return new ReplyKeyboardMarkup(List.of(row));
    }

    public static ReplyKeyboard getWorkspaces() {
        KeyboardRow row1 = new KeyboardRow();
        row1.add("workspace 1");
        KeyboardRow row2 = new KeyboardRow();
        row2.add("workspace 2");
        KeyboardRow row3 = new KeyboardRow();
        row3.add("workspace 3");
        KeyboardRow row4 = new KeyboardRow();
        row4.add("workspace 4");
        return ReplyKeyboardMarkup.builder().keyboardRow(row1).keyboardRow(row2).keyboardRow(row3).keyboardRow(row4).build();
    }

    public static ReplyKeyboard getTasks() {
        KeyboardRow row1 = new KeyboardRow();
        row1.add("task 1");
        KeyboardRow row2 = new KeyboardRow();
        row2.add("task 2");
        KeyboardRow row3 = new KeyboardRow();
        row3.add("task 3");
        KeyboardRow row4 = new KeyboardRow();
        row4.add("task 4");
        return ReplyKeyboardMarkup.builder().keyboardRow(row1).keyboardRow(row2).keyboardRow(row3).keyboardRow(row4).build();
    }
}
