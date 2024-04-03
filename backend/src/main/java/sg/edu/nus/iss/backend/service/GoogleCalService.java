package sg.edu.nus.iss.backend.service;

import java.util.Collections;
import java.util.Date;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.google.api.client.auth.oauth2.AuthorizationCodeRequestUrl;
import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.auth.oauth2.TokenResponse;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import com.google.api.client.googleapis.auth.oauth2.GoogleClientSecrets;
import com.google.api.client.googleapis.auth.oauth2.GoogleClientSecrets.Details;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.HttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.google.api.client.util.DateTime;
import com.google.api.services.calendar.Calendar.Events;
import com.google.api.services.calendar.CalendarScopes;

@Service
public class GoogleCalService {

    private static final String APPLICATION_NAME = "";
	private static HttpTransport httpTransport;
	private static final JsonFactory JSON_FACTORY = JacksonFactory.getDefaultInstance();
	private static com.google.api.services.calendar.Calendar client;

	GoogleClientSecrets clientSecrets;
	GoogleAuthorizationCodeFlow flow;
	Credential credential;

	@Value("${google.client.client.id}")
	private String clientId;

	@Value("${google.client.client.secret}")
	private String clientSecret;

	@Value("${google.client.redirectUri}")
	private String redirectURI;

    final DateTime date1 = new DateTime("2017-05-05T16:30:00.000+05:30");
	final DateTime date2 = new DateTime(new Date());

    public String authorize() throws Exception {
		AuthorizationCodeRequestUrl authorizationUrl;
		if (flow == null) {
			Details web = new Details();
			web.setClientId(clientId);
			web.setClientSecret(clientSecret);
			clientSecrets = new GoogleClientSecrets().setWeb(web);
			httpTransport = GoogleNetHttpTransport.newTrustedTransport();
			flow = new GoogleAuthorizationCodeFlow.Builder(httpTransport, JSON_FACTORY, clientSecrets,
					Collections.singleton(CalendarScopes.CALENDAR)).build();
		}

		authorizationUrl = flow.newAuthorizationUrl().setRedirectUri(redirectURI);

		System.out.println("cal authorizationUrl->" + authorizationUrl);
		return authorizationUrl.build();
	}

    public boolean getToken(String code, String userId){
        com.google.api.services.calendar.model.Events eventList;
		String message;
		try {
			
			TokenResponse response = flow.newTokenRequest(code).setRedirectUri(redirectURI).execute();
			credential = flow.createAndStoreCredential(response, userId);
			client = new com.google.api.services.calendar.Calendar.Builder(httpTransport, JSON_FACTORY, credential)
					.setApplicationName(APPLICATION_NAME).build();
			Events events = client.events();
			eventList = events.list("primary").setTimeMin(date1).setTimeMax(date2).execute();
			message = eventList.getItems().toString();
			System.out.println("My:" + eventList.getItems());
			System.out.println("cal message:" + message);
			return true;

		} catch (Exception e) {

			message = "Exception while handling OAuth2 callback (" + e.getMessage() + ")."
					+ " Redirecting to google connection status page.";
			return false;
		}
    }

    
}
