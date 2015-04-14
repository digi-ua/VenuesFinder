Template.content.created = function (){
	var lat = new ReactiveVar(); //Template.instance().lat
	var lng = new ReactiveVar();
	lat.set("");
	lng.set("");

	Venues = new Mongo.Collection(null);
	Queries = new Mongo.Collection(null);	
  }

  Template.content.rendered = function (){
		if (! Session.get('map'))
        gmaps.initialize();
  };
  
Template.content.helpers({  
    lat: function () {return Template.instance().lat.get();},
	lng: function () {return Template.instance().lng.get();},  
  });

  Template.content.events({    
  
	"submit .searchform": function (e,tmp) {    
		e.preventDefault();	
		
		//get current map's coors
		var currCoors = gmaps.map.getCenter();
		tmp.lat=currCoors.lat();
		tmp.lng=currCoors.lng();		
		
		var query = {
			query: document.getElementById("query").value,
			lat: tmp.lat.toFixed(5),
			lng: tmp.lng.toFixed(5),
			datetime: new Date().toLocaleString()
		};
		Queries.insert(query);
		
		var table = document.getElementById("queriesHistory");
		var row = table.insertRow(0);		
		var cell1 = row.insertCell(0).innerHTML = query.query;
		var cell2 = row.insertCell(1).innerHTML = query.lat;
		var cell3 = row.insertCell(2).innerHTML = query.lng;
		var cell4 = row.insertCell(3).innerHTML = query.datetime;
				
		$.ajax({
	  		type: "GET",
	  		url: "https://api.foursquare.com/v2/venues/explore?ll="+tmp.lat+","+tmp.lng+"&client_id=3MKW4NVF0BT0TLN3RVKCOQXSW2KJD32STSWNEKMIP3XITCRE&client_secret=KVV5X11YFGDXPTPBVYTQ1QU50ATAJ5210ME331HXSKZPWUH5&v=20130619&query="+$("#query").val()+"",
	  		success: function(data) {
			
				//remove prev data
				gmaps.delMarkers();
				$("#venues").html("");
								
				var dataobj = data.response.groups[0].items;
				var appendeddatahtml = '<table id="venuesList" class="venuesList"><thead><tr><th>Name</th><th>Rating</th><th>City</th><th>Address</th><th>Lat</th><th>Lng</th><th>Distance</th></tr></thead><tbody>';
								
				for(var i = 0; i < dataobj.length; i++){
					var venue = {
					name:"",
					rating:"",
					city:"",
					address:"",
					lat:"",
					lng:"",
					distance:""					
					};
					venue.name = dataobj[i].venue.name;
					if(dataobj[i].venue.rating){venue.rating = dataobj[i].venue.rating;}
					if(dataobj[i].venue.location.city){venue.city = dataobj[i].venue.location.city;}
					if(dataobj[i].venue.location.address){venue.address = dataobj[i].venue.location.address;}
					venue.lat = dataobj[i].venue.location.lat;
					venue.lng = dataobj[i].venue.location.lng;
					venue.distance = dataobj[i].venue.location.distance;
										
					Venues.insert(venue);//console.log(venue);
					
					appendeddatahtml += '<tr><td>'+ venue.name +'</td><td>'+ venue.rating +'</td><td>'+ venue.city +'</td><td>'+ venue.address +'</td><td>'+ venue.lat.toFixed(5) +'</td><td>'+ venue.lng.toFixed(5) +'</td><td>'+ venue.distance +'</td></tr>';					
						
					//draw marker
					var markerInfo = {
					title: venue.name,
					lat: venue.lat,
					lng: venue.lng
					};
					gmaps.addMarker(markerInfo);
				}
				
				appendeddatahtml += '</tbody></table>';
				
				$("#venues").append(appendeddatahtml);
			}
		});
	}
  
  });
  





