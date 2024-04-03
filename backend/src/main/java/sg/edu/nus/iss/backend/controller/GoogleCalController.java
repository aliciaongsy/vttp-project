package sg.edu.nus.iss.backend.controller;

import java.io.IOException;
import java.util.HashSet;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.view.RedirectView;

import com.google.api.services.calendar.model.Event;

import jakarta.json.Json;
import jakarta.json.JsonObjectBuilder;
import jakarta.servlet.http.HttpServletRequest;
import sg.edu.nus.iss.backend.service.GoogleCalService;

@Controller
@CrossOrigin
public class GoogleCalController {

	@Autowired
	private GoogleCalService googleSvc;

	private boolean authStatus;
	private String userId;

	private Set<Event> events = new HashSet<>();

	public void setEvents(Set<Event> events) {
		this.events = events;
	}

	@GetMapping("/google/auth/login")
	public ResponseEntity<String> googleConnectionStatus(HttpServletRequest request,
			@RequestParam(value = "id") String id) throws Exception {

		userId = id;
		String url = googleSvc.authorize();

		JsonObjectBuilder builder = Json.createObjectBuilder();
		builder.add("url", url);

		return ResponseEntity.ok(builder.build().toString());
	}

	@GetMapping("/google/auth/callback")
	public RedirectView oauth2Callback(@RequestParam(value = "code") String code) {

		authStatus = googleSvc.getToken(code, userId);

		if (authStatus){
			return new RedirectView("http://localhost:8080/google/auth/success");
		}
		else {
			return new RedirectView("http://localhost:8080/google/auth/error");
		}

	}

	@GetMapping("/google/auth/success")
	@ResponseBody
	public String success() {
		return "Successful authorisation, you may close this tab";
	}

	@GetMapping("/google/auth/error")
	@ResponseBody
	public String error() {
		return "Unsuccessful authorisation, you may close this tab and retry";
	}

	@GetMapping("google/auth/status")
	@ResponseBody
	public ResponseEntity<String> getStatus() {
		JsonObjectBuilder builder = Json.createObjectBuilder();
		builder.add("status", authStatus);
		return ResponseEntity.status(authStatus ? HttpStatusCode.valueOf(200) : HttpStatusCode.valueOf(400))
				.body(builder.build().toString());
	}

	public Set<Event> getEvents() throws IOException {
		return this.events;
	}

}
