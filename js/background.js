var content_port = null;
var options_port = null;
var popup_port = null;

var handle_content = (message) =>
{
	if(message.type == 'agents'){
		let agents = [];
		for(let agent of message.data){
			try {
				agents.push(amap(agent));
			}
			catch {
                console.log('agent fail');
				console.log(agent);
			}
		}
		fetch('https://rvz.io/agents',{
			method: 'POST',
			body: JSON.stringify(agents)
		}).then(res => res.json()).then(res => console.log(res));
	}
	else
	if(message.type == 'tickets'){
		let tickets = [];
		for(let ticket of message.data){
			try {
				tickets.push(tmap(ticket));
			}
			catch {
				console.log(ticket);
			}
		}
		fetch('https://rvz.io/tickets',{
			method: 'POST',
			body: JSON.stringify(tickets)
		}).then(res => res.json()).then(res => console.log(res));
    }
    else
    if(message.type == 'popup'){
        popup_port.postMessage(message);
    }
}

var handle_options = message =>
{
	console.log(`Received from options page: ${JSON.stringify(message)}`);
	content_port.postMessage(message);
}

function handle_popup(message){
    content_port.postMessage(message);
}

var connection_made = port =>
{
	if(port.name == 'content')
	{
		content_port = port;
		port.onMessage.addListener(handle_content);
	}
	if(port.name == 'options')
	{
		options_port = port;
		port.onMessage.addListener(handle_options);
    }
    if(port.name == 'popup')
    {
        popup_port = port;
        port.onMessage.addListener(handle_popup);
    }
	port.onDisconnect.addListener(port => { if(port.name == 'content') content_port = null; if(port.name == 'options') options_port = null; if(port.name == 'popup') popup_port = null;});
}

chrome.runtime.onConnect.addListener(connection_made);


function tmap(values) {
    let orgs = {
        "5ae2d1bb-4d3a-441a-a649-9d3a6b0cbc08": "Default",
        "b8b9ea08-2225-4b7c-b065-8e1d379c6be5": "Inty",
        "b36daa47-45b6-4081-8497-5c10e0df0ba3": "CSS-Classic",
        "d25a1b93-eb14-4619-9a58-ab78102a33b9": "Experis",
        "a488d21d-c7ca-405d-9408-900ce9d49bde": "Avanade",
        "4769bedf-f0ab-4ef6-85d5-3e52fcdd61bb": "Engineering",
        "3a5775df-563c-4dd1-8d3f-ddca6b743e2a": "OCAS ",
        "0a4e05ee-2ea2-4433-9b68-c527c8fa34ef": "Office365Teams",
        "c55c07c1-ef42-4305-acde-81c739c63763": "CSS-Concierge",
        "f7c8c014-749a-4063-b1ac-604de8a0ee42": "FTC",
        "5fe13eb5-3ce7-4e79-a652-82ab7dc8d32b": "Sherweb",
        "080745a4-0d94-4b90-89ea-895138ed9d73": "OXO",
        "19141900-f6b5-450a-ae5c-da40b2bbfd94": "IP",
        "0c710047-8a89-49fa-962d-ec3ca6958f57": "Outlook",
        "5479e086-f9d2-4649-960e-4e30a63e49d6": "Skype",
        "0d59b084-94aa-4b72-9fc0-11478e3dc418": "ODSP",
        "1792a093-4170-4ece-a43c-bd088e8163de": "Ingram",
        "c0bbe45e-b46d-4878-b17e-26ad36c569de": "Commerce",
        "3a8c047e-476d-47c3-97ea-f4d6600da7bd": "MAX-dhent",
        "0ff1ce4a-44e7-1951-91eb-af75db2743d7": "OfficeMarketing",
        "0ff1ce36-5ad7-14cf-bb10-d51bd40426d4": "Office365Admin",
        "31440c55-0000-1111-2222-000000000000": "Wipro",
        "e2c27122-a860-4353-914a-333889f2a194": "FTC-RINF",
        "fff8ead0-8002-4224-a0fe-76be436adbd8": "FTC-IntlVendor",
        "f953d094-f11a-44c9-bf5f-2d33cbada21e": "FTC-Blueprint",
        "3af532eb-524e-4ece-9196-f5a445eb3493": "FTC-Experis",
        "4417e9b9-8756-4065-a346-7761e3983589": "RHIPE",
        "a1c4e31d-4c2b-4b4b-90e6-00d7e6f01f8c": "Alchemy",
        "ce04dc57-2c8c-4ef1-ab9c-4142517f8c5d": "HPE Enterprise Services",
        "6a2d6acf-d3eb-494d-810e-13a85cab7797": "CRMConcierge",
        "3a23e7d2-3939-4a78-9d3c-d9e311e685f3": "AlchemyPrime",
        "ca0b610c-ad50-4a7d-a166-471f6adec97c": "Upworks",
        "0f7ded64-140b-4f8d-baa2-faf629f3b0bf": "TP",
        "c82b4a39-1e93-492f-ab14-d1a14f278fd6": "CVG",
        "2e144757-2775-42d1-93aa-ea94454c37b2": "NTT",
        "5123711f-adb1-4440-808f-c8142f78d819": "CSS-Proactive",
        "c76595a8-fe65-4a11-8753-3ecc53b3b196": "MAAX Cloud",
        "6149aa38-9a7f-4d97-85d1-58669810cbf3": "Zones",
        "9d05f0a4-771d-4d6c-85d4-564dd8337329": "AlchemyPrime-SHR",
        "b545fc1d-b078-45bc-8162-01322e1a3567": "CVG WIL",
        "710fa61f-82d0-4a72-b1bd-dc64f481cc0d": "CSS-Commerce",
        "aa731bf9-3c7d-4016-8b16-49e6198d0534": "Kaizala",
        "79613499-aca1-4270-9a4c-b627fafe5eb0": "CRMCSS"
    }

    return {
        acknowledge_time: values.RequestData.AcknowledgeDateTime,
        close_time: values.RequestData.ClosedDateTime,
        complete_time: values.RequestData.CompletedDateTime,
        create_time: values.RequestData.CreateDateTime,
        feedback_time: values.RequestData.CustomerFeedbackDateTime,
        ivr_outbound_time: values.RequestData.IvrOutboundCallTime,
        last_updated_time: values.RequestData.LastUpdatedTime,
        route_time: values.RequestData.RouteDateTime,
        last_action_time: values.RequestData.LastActionTime,

        resolved_bool: values.RequestData.IsResolved,
        reopened_bool: values.IsReopenedCase,
        phone_survey: values.RequestData.ExtensionAttributes.PhoneSurvey,
        rating: values.Rating,
        state: values.RequestData.State,
        ffr: new Date(new Date().setTime(new Date(values.RequestData.CreateDateTime).getTime() + (14 * 24 * 60 * 60 * 1000))).toISOString(),

        source: values.RequestData.Source,
        area_name: values.RequestData.SupportAreaName,
        ticket_type: values.RequestData.PrimaryTicketType,
        role_string: values.RolesString,
        partner_id: values.RequestData.PartnerId,
        agent_email: values.RequestData.ExtensionAttributes.AgentEmail,
        request_id: values.RequestData.RequestId,
        organization: orgs[values.RequestData.OrganizationId],
        org_id: values.RequestData.OrganizationId,
        tenant_id: values.RequestData.TenantId,
        app_name: values.RequestData.ExtensionAttributes.AppName,
        customer_type: values.RequestData.ExtensionAttributes.CustomerCompanyType,

        preferred_email: values.RequestData.ExtensionAttributes.PreferredEmail,
        user_email: values.RequestData.UserEmail,
        alternate_email: values.RequestData.ExtensionAttributes.AlternateEmail,
        user_phone: values.RequestData.UserPhone,
        ivr_contact_phone: values.RequestData.ExtensionAttributes.contact_phone_number,
        ivr_callback_phone: values.RequestData.ExtensionAttributes.IVRCallbackNumber,
        phone_number: values.RequestData.PhoneNumber,
        iso_code: values.RequestData.ExtensionAttributes.IsoCallingCode,
        is_ivr: (values.RolesString == 'IVR'),

        ticket_number: values.RequestData.ParatureTicketNumber,
        notes: values.RequestData.Notes,
        timezone: values.RequestData.ExtensionAttributes.TimezoneOffsetInMinutes,
        license_count: values.RequestData.ExtensionAttributes.TenantLicenseCount,
        company_name: values.RequestData.ExtensionAttributes.CompanyName,
        browser: values.RequestData.ExtensionAttributes.Browser,
        os: values.RequestData.ExtensionAttributes.OS,
        country_code: values.RequestData.ExtensionAttributes.TenantCountryCode,
        first_name: values.RequestData.UserFirstName,
        last_name: values.RequestData.UserLastName,  
        description: values.RequestData.UserDescription,
        wait_time: values.RequestData.ExtensionAttributes.WaitTime,
        customer_contacts: values.RequestData.customerContacts
    }
}

function amap(values) {
    return {
        partner_id: values.PartnerData.PartnerId,
        fullname: values.FullName,
        email: values.PartnerData.Email,
        phone: values.PartnerData.Phone,
        status: values.Status,
        lastavailable: new Date(values.PartnerData.LastAvailableDateTime).toJSON(),
        laststatuschange: new Date(values.PartnerData.LastStatusChangedTime).toJSON(),
        sub_org: values.PartnerData.SubOrgTag
    }
}