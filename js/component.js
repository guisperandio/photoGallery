var page = 1;
showLoading();
initialFill();

//start of the methods and functions
//support methods
// function to fill the homepage
function initialFill(){
	//There i can use "data => createNewPhotoBlock(data, firstFill = 1)" instead "function (data) { createNewPhotoBlock(data, firstFill = 1) })", but it dont work in IE LT 11
	getPhotos(per_page = 5, page, function (data) { createNewPhotoBlock(data, firstFill = 1) });
}
document.addEventListener("scroll", function (event) {
    checkEndOfPage();
});
// function to show loaginImg
function showLoading(){
	document.getElementById('loadingImg').setAttribute('class', 'visible');
}
// function to hide loaginImg
function hideLoading(){
	document.getElementById('loadingImg').setAttribute('class', 'hidden');
}
// function to delete selected element
function deleteElement(id){
	var elem = document.getElementById(id);
	return elem.parentNode.removeChild(elem);
}
// end of the support methods

//json request to flickr API
function getJSON(config, callback){
	var xmlhttp = new XMLHttpRequest();
    xmlhttp.onload = function() {
       if (xmlhttp.status == 200) {
        	callback(this.responseText);
        	hideLoading();
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
	
	var photosObj = getJSON(config, function(data){callback(JSON.parse(data))});
}

function buildHTMLPhotoBlock(photoElement){
	if(photoElement.title.length > 30)
		photoElement.title = photoElement.title.substr(0, 30) + '...';
	if(photoElement.title == '')
		photoElement.title = '<div class="alert alert-warning top">This image has no title.</div>';
	var html = '<div class="col-1-sm col-2-md col-3-bg"> '
				+ '<div class="box-photo">' 
					+ '<div class="img-container">'
						+ '<div class="img-box" style="background-image: url('+photoElement.url_q+');"></div>'
					+ '</div>'
					+ '<div class="info-container" id="'+photoElement.id+'">'
						+'<h2 class="photo-title">'+ photoElement.title +'</h2>'
						+'<button id="btn-'+photoElement.id+'" class="bgr-gray load-tags" onclick="getTags('+photoElement.id+', function(data) { generateTags(data) })">Load Tags</button>'
					+'</div>'
				+'</div>'
			+ '</div>';
	return html;
}

function createNewPhotoBlock(photosObj, firstFill){
	firstFill = firstFill || 0;
	var photos = photosObj.photos.photo;
	var htmlBlock = '';
	photos.forEach( function(photoElement, index) {
		htmlBlock += buildHTMLPhotoBlock(photoElement);
	});
	
	document.getElementById('photoBlock').innerHTML += htmlBlock;

	if(firstFill == 1){
		checkEndOfPage(firstFill);
	}
}

function getTags(elementId, callback){
	var config = {};
	config.api_key = 'da328dff5fe5e3ddd61cb3e7ceebb771';
	config.url_request = 'https://api.flickr.com/services/rest/?method=flickr.photos.getInfo& '+
							'api_key='+config.api_key+
							'&photo_id='+elementId+
							'&format=json&nojsoncallback=1';
	var tagsObj = getJSON(config, function(data) { callback(JSON.parse(data)) });
}
function buildHTMLTagsBlock(tagElement, index){
	var liClass = 'display';
	if(tagElement.raw.length > 10)
		tagElement.raw = tagElement.raw.substr(0, 10) + '...';
	if(index >= 3)
		liClass = 'no-display';
	var html = '<li class="tag '+liClass+'">'+tagElement.raw+'</li>';
	return html;
}
function generateTags(tagsObj){
	var tags = tagsObj.photo.tags.tag;
	var htmlBlock = '<ul class="list-tags">';
	if(Object.keys(tags).length > 0){
		var count = 0;
		tags.forEach( function(tag, index) {
			htmlBlock += buildHTMLTagsBlock(tag, index);
			count = index;
		});	
		if(count >= 3)
			htmlBlock += '<li class="tag tagButton" id="tag-'+tagsObj.photo.id+' "onclick="showAllTags(this)")>...</li>'
		
		htmlBlock += '</ul>';
		document.getElementById(tagsObj.photo.id).innerHTML += htmlBlock;
		deleteElement('btn-'+ tagsObj.photo.id);
	}
	else{
		deleteElement('btn-'+ tagsObj.photo.id);
		document.getElementById(tagsObj.photo.id).innerHTML += '<div class="alert alert-warning bottom">This image has no tags!</div>';	
	}	
}

function showAllTags(listMore){
	listMore.parentNode.parentNode.parentNode.setAttribute('class', 'box-photo box-photo-all-infos')
	ulListTagsHeight = listMore.parentElement.clientHeight + 100;
	listMore.parentNode.parentNode.parentNode.setAttribute('style', 'height: ' + ulListTagsHeight + 'px !important;')
	deleteElement(listMore.getAttribute('id'))
}

function checkEndOfPage(firstFill){

	firstFill = firstFill || 0;
	var endOfPage = document.getElementById('photoGallery').offsetHeight;
    var lastDiv = document.querySelector("#photoBlock > div:last-child");
    var lastDivOffset = lastDiv.offsetTop + lastDiv.clientHeight;
    var pageOffset = window.pageYOffset + window.innerHeight;
    if(firstFill == 0){	
	   	if(pageOffset >= endOfPage){
	   		showLoading();
	   		getPhotos(per_page = 5, page = 1, function(data){createNewPhotoBlock(data)});
	   	}
    }
   	else if(lastDivOffset < window.innerHeight){
    	page++;
	   	showLoading();
   		getPhotos(per_page = 5, page, function(data){ createNewPhotoBlock(data, firstFill = 1) });
   	}

}


