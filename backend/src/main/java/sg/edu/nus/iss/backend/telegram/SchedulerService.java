package sg.edu.nus.iss.backend.telegram;

import java.util.List;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.springframework.stereotype.Service;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.bots.AbsSender;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;

import sg.edu.nus.iss.backend.model.Reminder;

@Service
public class SchedulerService {
    
    private static Logger logger = Logger.getLogger(SchedulerService.class.getName());
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
    private final AbsSender absSender;
    private final RemindersService remindersService;

    public SchedulerService(AbsSender absSender, RemindersService remindersService){
        this.absSender = absSender;
        this.remindersService = remindersService;
    }

    public void scheduleSetup(){
        logger.log(Level.INFO, "Setting up Scheduler");
        scheduler.scheduleAtFixedRate(this::process, 5L, 10L, TimeUnit.SECONDS);
    }

    public void process(){
        System.out.println("processing...");
        List<Reminder> reminders = remindersService.getAllReminders();
        reminders.forEach(r -> {
            System.out.println(r.toString());
            try {
                absSender.execute(SendMessage.builder()
                    .text(r.getMessage())
                    .chatId(r.getChatId())
                    .build());

                remindersService.markComplete(r);

            } catch (TelegramApiException e) {
                e.printStackTrace();
            }
        });
    }

}
