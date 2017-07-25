//global variables and initial fil of page
var page = 1;
initialFill();

//start of the methods and functions
function initialFill(){
	getPhotos(per_page = 5, page, data => { createNewPhotoBlock(data, initialFill = 1) });
}
function deleteElement(id){
	var elem = document.getElementById(id);
	return elem.parentNode.removeChild(elem);
}
function generateTags(tagsObj){
	var tags = tagsObj.photo.tags.tag;
	var htmlBlock = '<ul class="list-tags">';
	if(Object.keys(tags).length > 0){
		tags.forEach( function(tag, index) {
			console.log(index)
			if(index >= 3){
				return false
			}
			else
				htmlBlock += buildHTMLTagsBlock(tag);
		});	
		htmlBlock += '</ul>';
		document.getElementById(tagsObj.photo.id).innerHTML += htmlBlock;
		deleteElement('btn-'+ tagsObj.photo.id);
	}
	else{
		deleteElement('btn-'+ tagsObj.photo.id);
		document.getElementById(tagsObj.photo.id).innerHTML += '<div class="alert alert-warning">This image has no tags!</div>';	
	}	
}
function getTags(elementId, callback){
	var config = {};
	config.api_key = 'da328dff5fe5e3ddd61cb3e7ceebb771';
	config.url_request = 'https://api.flickr.com/services/rest/?method=flickr.photos.getInfo& '+
							'api_key='+config.api_key+
							'&photo_id='+elementId+
							'&format=json&nojsoncallback=1';
	var tagsObj = getJSON(config, data => callback(JSON.parse(data)));
}

function getJSON(config, callback){
	var xmlhttp = new XMLHttpRequest();
    xmlhttp.onload = function() {
       if (xmlhttp.status == 200) {
        	callback(this.responseText);
       }
       else if (xmlhttp.status == 400) {
          alert('There was an error 400');
       }
       else {
           alert('something else other than 200 was returned');
       }  
    };
    xmlhttp.open("GET", config.url_request, true);
    xmlhttp.send();
}

function getPhotos(per_page, page, callback){
	var config = {};
	config.api_key = 'da328dff5fe5e3ddd61cb3e7ceebb771';
	config.per_page = per_page;
	config.page = page;
	config.url_request = 'https://api.flickr.com/services/rest/? ' + 
							'&method=flickr.photos.getRecent&format=json' +
							'&api_key='+config.api_key+'&nojsoncallback=1' +
							'&per_page=' + config.per_page + 
							'&page=' + config.page +
							'&extras=url_q';
	
	var photosObj = getJSON(config, data => callback(JSON.parse(data)));
}

function buildHTMLTagsBlock(tagElement){
	if(tagElement.raw.length > 10)
		tagElement.raw = tagElement.raw.substr(0, 10) + '...';
	var html = '<li class="tag">'+tagElement.raw+'</li>';
	return html;
}

function buildHTMLPhotoBlock(photoElement){
	if(photoElement.title == '')
		photoElement.title = 'This image has no title.';

	var html = '<div class="col-1-sm col-2-md col-3-bg"> '
				+ '<div class="box-photo">' 
					+ '<div class="img-container">'
						+ '<div class="img-box" style="background-image: url('+photoElement.url_q+');"></div>'
						+ '<img src="'+photoElement.url_q+'" alt="Pontevecchio, Florence">'
					+ '</div>'
					+ '<div class="info-container" id="'+photoElement.id+'">'
						+'<h2 class="photo-title">'+ photoElement.title +'</h2>'
						+'<button id="btn-'+photoElement.id+'" class="bgr-gray load-tags" onclick="getTags('+photoElement.id+', data => { generateTags(data) })">Load Tags</button>'
					+'</div>'
				+'</div>'
			+ '</div>';
	return html;
}

function createNewPhotoBlock(photosObj, initialFill = 0){
	var photos = photosObj.photos.photo;
	var htmlBlock = '';
	photos.forEach( function(photoElement, index) {
		htmlBlock += buildHTMLPhotoBlock(photoElement);
	});
	document.getElementById('photoBlock').innerHTML += htmlBlock;

	if(initialFill == 1){
		checkEndOfPage(initialFill);
	}
}

document.addEventListener("scroll", function (event) {
    checkEndOfPage();
});

function checkEndOfPage(initialFill = 0){
	var endOfPage = document.getElementById('photoGallery').offsetHeight;
    var lastDiv = document.querySelector("#photoBlock > div:last-child");
    var lastDivOffset = lastDiv.offsetTop + lastDiv.clientHeight;
    var pageOffset = window.pageYOffset + window.innerHeight;
    page++;
    if(initialFill == 0){
	   	if(pageOffset >= endOfPage){
	   		getPhotos(per_page = 5, page, data => { createNewPhotoBlock(data) });
	   	}
    }
   	else if(lastDivOffset < window.innerHeight){
   		getPhotos(per_page = 5, page, data => { createNewPhotoBlock(data, initialFill = 1) });
   	}
}


