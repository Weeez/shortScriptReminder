var storedList = [];
var rowIdCounter = 0;

/*--scolling calculation-*/
var scrolled = 0;
var scrollingSize = 43;
var scrollCounter = 0;
var maxScroll = 0;
var maxRowsOnScreen = 8;

$(document).on('DOMContentLoaded', function(){
	init();
});

function init(){
	initEnvironmentBehavior();
	initList();	
	updateMaxScroll();
}

function initEnvironmentBehavior(){
	var downloadButton = $("#downloadButton")[0];
	var addToListButton = $("#addToListButton")[0];
	var scriptBox = $("#scriptBox")[0];
	
	$(downloadButton).on("click", function(){
		download();
	});
	
	$(addToListButton).on("click", function(){				
		
		var newName = $("#name").val();
		var newScript = $('#myScript').val();
		var newId = createUniqueId();

		if(newName != "" && newScript != "" && newId != ""){			
			calculateListElements(newId, newName, newScript);
				
			storedList.push({id: newId, name: newName, script: newScript});
			localStorage.setItem("list", JSON.stringify(storedList));
			updateMaxScroll();	
			clearInputFields();		
		}		
	});	
	
	$(scriptBox).on("click", function(){
		navigateTo("left");
		scrolled = 0;
		scrollCounter = 0;
	});			
	
	$(document).on("wheel", function(e){				
		var isListView = $("#listContainer")[0].classList.contains("listContainerOff");		
		if(isListView){
			var yAxis = e.originalEvent.deltaY; //e.deltaY
			if(yAxis > 0 && scrollCounter <= maxScroll){ //scrollDown
				scrolling("down");
			}else if(yAxis < 0 && (scrollCounter-1) >= 0){ //scrollUp
				scrolling("up");
			}
		}
	});	
}		

function initList(){
	if(localStorage.list == undefined || localStorage.list == null){		
		localStorage.setItem("list", JSON.stringify([]));
	}else{
		storedList = JSON.parse(localStorage.getItem("list"));
	
		for(var i = 0; i < storedList.length; i++){			
			calculateListElements(storedList[i]["id"], storedList[i]["name"], storedList[i]["script"]);
		}
	}
}

function calculateListElements(listId_, listName_, listScript_){
	var parent = $("#list")[0];	
	
	var listRow = document.createElement('div');
	listRow.id = "listRow" + rowIdCounter;		
	listRow.classList.add("listRow");
	listRow.setAttribute("rowId", listId_);
	
	var listRemove = document.createElement('div');
	listRemove.id = "listRemove" + rowIdCounter;
	listRemove.classList.add("col-xs-2");
	
	var listRemoveButton = document.createElement('button');
	listRemoveButton.type = "button";
	listRemoveButton.id = "listRemoveButton" + rowIdCounter;
	listRemoveButton.classList.add("btn");
	listRemoveButton.classList.add("btn-default");
	listRemoveButton.classList.add("btn-sm");
	listRemoveButton.classList.add("myButton");	
	
	var listRemoveSymbol = document.createElement('span');
	listRemoveSymbol.classList.add('glyphicon');
	listRemoveSymbol.classList.add('glyphicon-minus');
	
	listRemoveButton.appendChild(listRemoveSymbol);
	$(listRemoveButton).on("click", function(e){
		function myId(){			
			var callerID = (e.originalEvent.path[3].id).match(/listRow\w+/g) == null ? e.originalEvent.path[2].id : e.originalEvent.path[3].id ;
			return document.getElementById(callerID).getAttribute("rowId");
		}
		
		var myId = myId();		
		var rowParent = $("[rowId='"+myId+"']")[0].parentNode;
		var thisRow = $("[rowId='"+myId+"']")[0];		
		rowParent.removeChild(thisRow);		

		if(storedList.length > maxRowsOnScreen){
			var listView = $("#listContainer")[0];
			scrollCounter--;
			scrolled += scrollingSize;
			listView.style.WebkitTransform = "translateY(" + scrolled +"px)";
		}
		updateMaxScroll();					
		actualizingStorage(myId);
	});

	listRemove.appendChild(listRemoveButton);	
		
	var listName = document.createElement('div');
	listName.id = "listName" + rowIdCounter;
	listName.textContent = listName_;
	listName.classList.add("listElementName");
	$(listName).on("click", function(){		
		navigateTo("right");
				
		var currentListScript = $("#scriptBox")[0];
		while (currentListScript.hasChildNodes()) {
			currentListScript.removeChild(currentListScript.lastChild);
		}
		
		//currentListScript.textContent = myJSBeautifier(listScript_);
		currentListScript.appendChild(myJSBeautifier(listScript_));
		
		clearInputFields();
	});		
	
	listRow.appendChild(listRemove);
	listRow.appendChild(listName);	
	
	parent.appendChild(listRow);	
	rowIdCounter++;
}

function actualizingStorage(id){
	var tmpElements = [];
	var requiredIndex = -1;
	
	for(var i = 0; i < storedList.length; i++){		
		if(storedList[i].id == id){
			requiredIndex = i;
		}
	}
	
	storedList.splice(requiredIndex, 1);
	
	for(var i = 0; i < storedList.length; i++){
		var name = storedList[i]["name"];
		var script = storedList[i]["script"];
		var rowId = storedList[i]["id"];
		
		tmpElements.push({id: rowId, name: name, script: script});		
	}
		
	localStorage.setItem("list", JSON.stringify(tmpElements));
}

function navigateTo(type){
	var listContainer = $("#listContainer")[0];	
	if(type == "left" || type == "right"){
		if(type == "left"){
			navigateLeft(listContainer);
		}
		else if(type == "right"){
			navigateRight(listContainer);
		}			
	}	
}

function navigateRight(listContainer){	
	listContainer.style.WebkitTransform = null;
	listContainer.classList.remove("listContainerOff");
	listContainer.classList.add("listContainerOn");
}

function navigateLeft(listContainer){
	listContainer.classList.remove("listContainerOn");
	listContainer.classList.add("listContainerOff");
}

function updateMaxScroll(){
	maxScroll = $("#list")[0].childElementCount - maxRowsOnScreen;
}

function scrolling(type){
	var listView = $("#listContainer")[0];
	if(type == "up" || type == "down"){
		if(type == "up"){
			scrollUp();
		}
		else if(type == "down"){
			scrollDown();
		}	
		listView.style.WebkitTransform = "translateY(" + scrolled +"px)";
	}	
}

function scrollDown(){
	scrollCounter++;
	scrolled -= scrollingSize;	
}

function scrollUp(){
	scrollCounter--;
	scrolled += scrollingSize;	
}

function myJSBeautifier(string){
	var beautiedJS = document.createElement("div");
	var newString = "";
	var tmpRow = "";
	var isSkip = false;
	var skipCounter = 0;
	
	function pushIntoTheBox(){
		var finishedTmpRow = document.createElement("p");
		finishedTmpRow.textContent = tmpRow;
		finishedTmpRow.appendChild(document.createElement("br"));		
		beautiedJS.appendChild(finishedTmpRow);
		tmpRow = "";
	}
	
	
	for(var i = 0; i < string.length; i++){
		var character = string[i];
		var nextChar1 = string[i+1];
		var nextChar2 = string[i+2];
				
		if(character != "\n"){
			if(character == ";" || character == "\{" || character == "\}"){
				if(character == "\}" && nextChar1 != "\""){
					character = "\n";
					character += string[i];
				}else if(character == "\{" && nextChar1 != "\""){
					character += "\n";
				}else if(character == ";" && nextChar1 != "\""){
					if(!isSkip){
						character += "\n";	
					}else{
						skipCounter--;
						if(skipCounter == 0){
							isSkip = false;
						}
					}					
				}
			}else if(character == "f"){
				if(nextChar1 == "o" && nextChar2 == "r"){
					isSkip = true;
					skipCounter = 2;
				}
			}
			newString += character;
		}		
	}
	
	
	
	for(var i = 0; i < newString.length; i++){
		var character = newString[i];
		if(character != "\n" && character != "\r" && character != "\r\n" ){
			tmpRow += character;
		}else{
			pushIntoTheBox();
		}		
	}
	
	if(tmpRow != ""){
		pushIntoTheBox();
	}
		
	return beautiedJS;
}

function clearInputFields(){
	$('#name').val("");	
	$('#myScript').val("");
}

function download(){
	window.URL = window.URL || window.webkitURL;
	
	var tmpStoredList = [];
	var realStoredList = JSON.parse(localStorage.getItem("list"));
	
	for(var i = 0; i < realStoredList.length; i++){
		var item = realStoredList[i];
		tmpStoredList.push(item.name + ": ");
		tmpStoredList.push(item.script + "\n");
	}	

	var blob = new Blob(tmpStoredList, {type: 'text/plain'});

	$('#downloadContainer').attr("href", window.URL.createObjectURL(blob));
	$('#downloadContainer').attr("download", "myScripts.txt");	
}

function createUniqueId(){
	var resultStrId = "";
	
	var strPrefix = "";	
	var strSuffix = "";
	var randomLength = Math.floor(Math.random() * 10)+1;
		
	while(strPrefix == "" || strPrefix == "\"" || strPrefix == "\'" || strPrefix == "\\" || strPrefix == " "){
		strPrefix = String.fromCharCode(Math.floor(Math.random() * 100));
	}	
	while(strSuffix == "" || strSuffix == "\"" || strSuffix == "\'" || strSuffix == "\\" || strSuffix == " "){
		strSuffix = String.fromCharCode(Math.floor(Math.random() * 100));
	}		
	
	resultStrId += strPrefix;	
	for(var i = 0; i < (randomLength); i++){
		resultStrId += Math.floor(Math.random() * 1000);
	}	
	resultStrId += strSuffix;
	
	if(storedList.length != 0){
		for(var i = 0; i < storedList.length; i++){
			if(storedList[i].id == resultStrId){
				var plusStrSuffix = "";
				while(plusStrSuffix == "" || plusStrSuffix == "\"" || plusStrSuffix == "\'" || plusStrSuffix == "\\"){
					plusStrSuffix = String.fromCharCode(Math.floor(Math.random() * 100));
				}	
				resultStrId += plusStrSuffix;
				i = 0;
			}
		}
	}
	return resultStrId;
}
