package sg.edu.nus.iss.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;
import org.telegram.abilitybots.api.bot.AbilityBot;
import org.telegram.telegrambots.meta.TelegramBotsApi;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;
import org.telegram.telegrambots.updatesreceivers.DefaultBotSession;

import sg.edu.nus.iss.backend.telegram.RemindersService;
import sg.edu.nus.iss.backend.telegram.SchedulerService;

@SpringBootApplication
public class BackendApplication {

	public static void main(String[] args) throws TelegramApiException {

		ConfigurableApplicationContext ctx = SpringApplication.run(BackendApplication.class, args);

		TelegramBotsApi botsApi = new TelegramBotsApi(DefaultBotSession.class);

		botsApi.registerBot(ctx.getBean("telegramBot", AbilityBot.class));

		new SchedulerService(ctx.getBean("telegramBot", AbilityBot.class), ctx.getBean("remindersService", RemindersService.class)).scheduleSetup();;
	}

}
