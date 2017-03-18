var config = {
    apiKey: "AIzaSyDMOy42GzcUjBXny8VfQsuXoI6bPSxjLZI",
    authDomain: "train-schedule-6876e.firebaseapp.com",
    databaseURL: "https://train-schedule-6876e.firebaseio.com",
    storageBucket: "train-schedule-6876e.appspot.com",
    messagingSenderId: "141941414558"
  };
firebase.initializeApp(config);

var database = firebase.database();
var trainKey = null;

$('#submit-button').on('click', submitTrain );

function submitTrain(){
	console.clear();
	var buttonAction = $('#submit-button').text();
	console.log( buttonAction )
	//prevent default button behavior
	event.preventDefault();
	var trainName = $('#name-input').val().trim();
	var trainDest = $('#destination-input').val().trim();
	var trainArrival = $('#time-input').val().trim();
	var trainFreq = parseInt( $('#freq-input').val().trim() );
	
	
	//creates a user object with all the pertinent info
	var trainObj = {
		name: trainName,
		destination: trainDest,
		arrival: trainArrival,
		frequency: trainFreq
	}

	console.log( trainName );
	if(trainObj.name == '' || trainObj.destination == '' || trainObj.arrival == '' || trainObj.frequency == ''){ 
		//do nothing if any field is blank
	}
	else{ //otherwise, do the magic

		$('#name-input').val('');
		$('#destination-input').val('');
		$('#time-input').val('');
		$('#freq-input').val('');
		

		if( buttonAction == 'Submit' ){
			console.log('Data being pushed')
			database.ref().push( trainObj );
		}
		else if ( buttonAction == 'Update' ){
			console.log('Data being updated')

			database.ref(trainKey).update( trainObj )

			$('#button-area').empty();
			$('#submit-button').text('Submit');
			database.ref(trainKey).once('value').then(function(childSnapshot){
				let snapshot = childSnapshot.val()

				var tableEntry = $('#' + trainKey)
				tableEntry.empty();
				tableEntry.append('<td>' + snapshot.name + '</td>')
						  .append('<td>' + snapshot.destination + '</td>')
				  		  .append('<td>' + snapshot.frequency + '</td>')
				          .append('<td>' + snapshot.arrival + '</td>')
				  		  .append('<td>' + arrivalCalculation(snapshot.arrival, snapshot.frequency) + '</td>')
				
			});

		}	
				
	}
	
	
}


function updateTrain() {
	$('#button-area').empty();
	$('#submit-button').text('Update');
	var deleteButton = $('<button>');
	var cancelButton = $('<button>');
	console.clear()
	trainKey = $(this).attr('id')

	console.log('Train key is ' + trainKey)
	deleteButton.attr('type', 'submit')
				.attr('class', 'btn btn-danger')
				.attr('id', 'delete-button')
				// .attr('key-val', $(this).attr('id') )
				.text('Delete')

	cancelButton.attr('type', 'submit')
				.attr('class', 'btn btn-default pull-right')
				.attr('id', 'cancel-button')
				.text('Cancel')

	$('#button-area').append(deleteButton)
	$('#button-area').append(cancelButton)

	database.ref(trainKey).once('value').then(function(childSnapshot){
		let snapshot = childSnapshot.val()
		
		console.log( snapshot.name )
		console.log( snapshot.destination )
		console.log( snapshot.arrival )
		console.log( snapshot.frequency )

		$('#name-input').val( snapshot.name );
		$('#destination-input').val( snapshot.destination );
		$('#time-input').val( snapshot.arrival );
		$('#freq-input').val( snapshot.frequency );		
	});
	
}

function addTrain( userObj, thisTrain ) {

	console.log(thisTrain);
	console.log(userObj);
	console.log(userObj.name);
	console.log(userObj.destination);
	console.log(userObj.arrival);
	console.log(userObj.frequency);

	//creates new table entry
	var tableEntry = $('<tr>');
	tableEntry.append('<td>' + userObj.name + '</td>')
			  .append('<td>' + userObj.destination + '</td>')
			  .append('<td>' + userObj.frequency + '</td>')
			  .append('<td>' + userObj.arrival + '</td>')
			  .append('<td>' + arrivalCalculation(userObj.arrival, userObj.frequency) + '</td>')
			  .attr('id', thisTrain )
			  .addClass('train')

	$('#train-table').append( tableEntry );

}

function deleteTrain(){
	console.clear();
	database.ref( trainKey ).remove();
	console.log( trainKey + ' is being deleted.');

	$('#name-input').val('');
	$('#destination-input').val('');
	$('#time-input').val('');
	$('#freq-input').val('');

	$('#button-area').empty();
	$('#submit-button').text('Submit');

}

function cancelUpdate(){
	trainKey = '';

	$('#name-input').val('');
	$('#destination-input').val('');
	$('#time-input').val('');
	$('#freq-input').val('');

	$('#button-area').empty();
	$('#submit-button').text('Submit');
}

database.ref().on('child_added', function( childSnapshot ) {

	addTrain( childSnapshot.val(), childSnapshot.key );
	console.log(childSnapshot.val());

	}	, function( errorObject){
	console.log("Errors handled: " + errorObject.code);
});

database.ref().on('child_removed', function( childSnapshot ) {
	console.clear();
	console.log('Child removed');
	console.log( childSnapshot.key );
	console.log(childSnapshot.val());

	$('#' + childSnapshot.key).remove();

	}	, function( errorObject){
	console.log("Errors handled: " + errorObject.code);
});

function arrivalCalculation( initialTime, freq ){
	let userTime = initialTime.split(':'); //gives an array with hour and minutes
	userTime[0] = parseInt( userTime[0] );
	userTime[1] = parseInt( userTime[1] ); //making into integers
	let rightNow = new Date(); //new date object
	let elapsedTime = [ ( parseInt( rightNow.getHours() ) - userTime[0] ), ( parseInt( rightNow.getMinutes() ) - userTime[1] ) ]; //time difference
	if( elapsedTime[0] < 0){ //if hours is negative, add 24 to it since it was yesterday
		elapsedTime[0] += 24;
	} 
	if( elapsedTime[1] < 0){ //if minutes is negative, add 60 to it and reduce hours by 1
		elapsedTime[0]--;
		elapsedTime[1] += 60;
	}
	let elapsedMinutes = elapsedTime[0]*60 + elapsedTime[1]; //calculate total minutes elapsed
	return freq - (elapsedMinutes % freq);
	

}

$(document).on('click', '.train', updateTrain );

$(document).on('click', '#delete-button', deleteTrain )

$(document).on('click', '#cancel-button', cancelUpdate )

