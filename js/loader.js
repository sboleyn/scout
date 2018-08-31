window.failure = false;
window.partner_id = false;
var backlog = [];

window.addEventListener('native-message', function(messageo){
	let headers = {};
	let message = messageo.detail;
	console.log(message);
	if(!window.partner_id){
		headers['partner_id'] = window.partner_id;
	}
	if(message.type == 'tickets'){
		if(message.data && message.data != null){
			backlog = [].concat.apply([],[backlog, message.data.map(ticket => ticket_map(ticket))]);
		}
	}
	else
	if(message.type == 'partner_id'){
		window.partner_id = message.data;
	}
});

setTimeout(function(){
	if(window.partner_id){
		console.log('sending backlog');
		fetch('https://scout.mural365.com/api/checktickets/'+window.partner_id).then(res => res.json()).then(res => {
			let tickets = backlog;
			let send_tickets = [];
			for(let ticket of tickets){
				if(res.indexOf(ticket.request_id) == -1)
				send_tickets.push(ticket);
			}
			fetch('https://scout.mural365.com/api/tickets', {
				method: 'POST',
				headers: {
					'partner_id':window.partner_id
				},
				'content-type': 'application/json',
				body: JSON.stringify(send_tickets)
			});
			console.log(send_tickets);

		});
	}
}, 120000);

function get_headers(){
    var custom_headers = new Headers({
        'SourceClient':'RAVE',
        'Authorization': `Bearer ${localStorage.getItem('adal.access.token.keyhttps://cxper.onmicrosoft.com/freelance/')}`,
        'Accept': 'application/json, text/plain, */*',
        'content-type':'application/json',
        'X-Requested-With':'XMLHttpRequest'
    });
    return custom_headers;
}

function open_tickets(callback){
    var custom_headers = get_headers();
    fetch(`https://rave.office.net/api/requests/organizations/c76595a8-fe65-4a11-8753-3ecc53b3b196/states/3?maxAgeInDays=180`,{
        headers: custom_headers
	}).then(response =>
		response.json()
	).then(res =>
		callback(
			res.map(ticket => ticket_map(ticket))
		)
	);
}

function get_agents(callback){
    var custom_headers = get_headers();
    fetch(`https://rave.office.net/api/userData/pagedUsers?pageNumber=1&pageSize=`,{
	    headers: custom_headers
    }).then(response => response.json()).then(response1 =>
        fetch(`https://rave.office.net/api/userData/pagedUsers?pageNumber=2&pageSize=`,{
            headers: custom_headers
        }).then(response => response.json()).then(response2 =>
            fetch(`https://rave.office.net/api/userData/pagedUsers?pageNumber=3&pageSize=`,{
                headers: custom_headers
            }).then(response => response.json()).then(response3 =>
                    callback([].concat.apply([],[response1,response2,response3]).map(agent => agent_map(agent)))
                )
            )
        )
}

function agent_map(values){
    
    return {
        fullname: values.FullName,
        email: values.PartnerData.Email,
        status: values.PartnerData.StatusReason,
        sub_org: values.PartnerData.SubOrgTag,
        admin: (values.PartnerData.Roles.indexOf('Admin') == -1) ? false : true,
        partner_id: values.PartnerData.PartnerId,
        laststatuschange: new Date(values.PartnerData.LastStatusChangedTime).toJSON(),
        lastavailable: new Date(values.PartnerData.LastAvailableDateTime).toJSON()
    }
}

function ticket_map(values) {

    return {
        acknowledge_time: new Date(values.RequestData.AcknowledgeDateTime).toJSON(),
        complete_time: new Date(values.RequestData.CompletedDateTime).toJSON(),
        create_time: new Date(values.RequestData.CreateDateTime).toJSON(),
        ivr_outbound_time: new Date(values.RequestData.IvrOutboundCallTime).toJSON(),
        last_updated_time: new Date(values.RequestData.LastUpdatedTime).toJSON(),
        resolved_bool: values.RequestData.IsResolved,
        reopened_bool: values.IsReopenedCase,
        rating: values.Rating,
        role_string: values.RolesString,
        partner_id: values.RequestData.PartnerId,
        request_id: values.RequestData.RequestId,
        tenant_id: values.RequestData.TenantId,
        ticket_number: values.RequestData.ParatureTicketNumber
    }
}

function updatecall(){
	fetch('https://scout.mural365.com/api/update').then(res => res.json()).then(res => {
		console.log(res);
		if(res.result){
			open_tickets(function(response){
				console.log('tickets');
				fetch('https://scout.mural365.com/api/tickets', {
					method: 'POST',
					headers: {
						'content-type': 'application/json'
					},
					body: JSON.stringify(response)
				}).then(r => r.json()).then(function(response){
					get_agents(function(response){
						console.log('get agents');
						fetch('https://scout.mural365.com/api/agents',{
							method: 'POST',
							headers: {
								'content-type': 'application/json'
							},
							body: JSON.stringify(response)
						})
					})
				})
			})
		}
	})
}

let inter = setInterval(updatecall, 60000);

var script = `
	function sendToContent(message){
		var event = new CustomEvent('native-message', {detail: message});
		window.dispatchEvent(event);
	}

	function testTicketUrl(url)
	{
		if(/https:\\/\\/rave.office.net\\/api\\/requests\\/AssignedToPartner/.test(url))
			return true;
		if(/https:\\/\\/rave.office.net\\/requests\\/resolved/.test(url))
			return true;
		if(/https:\\/\\/rave.office.net\\/requests\\/completed/.test(url))
			return true;
		if(/https:\\/\\/rave.office.net\\/requests\\/closed/.test(url))
			return true;
		if(/https:\\/\\/rave.office.net\\/requests\\/active/.test(url))
			return true;
		return false;
	}

	function testAgentUrl(url)
	{
		if(/rave.office.net\\/api\\/userData\\/pagedUsers/.test(url))
			return true;
		return false;
	}

	function testUser(url){
		if(/\\/api\\/userData\\/users\\/bootstrap/.test(url))
			return true;
		return false;
	}

	;(function(open){
		XMLHttpRequest.prototype.open = function(){
			this.addEventListener("readystatechange", function(){
				if(this.readyState == 4){
					if(testTicketUrl(this.responseURL)){
						var data = JSON.parse(this.response);
						var obj = {
							type: 'tickets',
							data: data
						}
						sendToContent(obj);
					}
					else
					if(testAgentUrl(this.responseURL)){
						var data = JSON.parse(this.response);
						if(data.length > 0){
							var obj = {
								type: 'agents',
								data: data
							}
							sendToContent(obj);
						}
					}
					if(/tenantInfo/.test(this.responseURL)){
						var tenant_id = this.responseURL.split('/')[5];
						openCmat(tenant_id)
						console.log('trying to fix cmat link');
					}
					if(testUser(this.responseURL)){
						var data = JSON.parse(this.response);
						console.log('yes');
						console.log(data);
						var partner_id = data.User.PartnerData.PartnerId;
						var obj = {
							type: 'partner_id',
							data: partner_id
						}
						sendToContent(obj);
					}
				}
			}, false);
			open.apply(this, arguments);
		};
	})(XMLHttpRequest.prototype.open);

	function openCmat(tenantId)
	{
		var results;
		let tryReq = function()
		{
			var results = document.evaluate('//a[contains(.,"Open CMAT")]', document, null, XPathResult.ANY_TYPE, null);
			var thisHead = results.iterateNext();
			if(!thisHead)
			{
				setTimeout(tryReq, 1000);
			}
			else
			{
				var windowUrl = 'https://cmat.tools.cp.microsoft.com/customer/portal?accountId=' + tenantId.toUpperCase() + '&accountType=Tenant&source=EWS&sessionId=' + System.Guid.NewGuid().ToString().toUpperCase();
				var ele = document.createElement('div');
				ele.innerText = 'Open CMAT';
				ele.style.cursor = 'pointer'
				thisHead.parentElement.replaceChild(ele, thisHead);
				ele.onclick=function(){
				window.open(windowUrl);}
			}
		}
		tryReq();
	}
`;

var s = document.createElement('script');
s.type = 'text/javascript';
s.innerHTML = script;
(document.head || document.documentElement).appendChild(s);