SP.SOD.executeFunc('sp.js', 'SP.ClientContext', sharePointReady);
var fileInput;
var bandFileUp=false;
$(document).ready(function()
{
    
    fileInput = $("#getFile");
    SP.SOD.executeFunc('sp.js', 'SP.ClientContext', registerClick);
    
});

function registerClick()
{
    //Register File Upload Click Event
    $("#addFileButton").click(readFile);
}

function sharePointReady() {
    url="/sites/CC140991/";
    clientContext = new SP.ClientContext(url);
    //website = clientContext.get_web();
    var oWeb = clientContext.get_web();
    console.log(window.location.href);
    var res = window.location.href.split("/");
    folderName= "Curso " + res[res.length-1] + "-" + res[res.length-2]; 
    var oList = oWeb.get_lists().getByTitle('Documents');

    itemCreateInfo = new SP.ListItemCreationInformation();  
    itemCreateInfo.set_underlyingObjectType(SP.FileSystemObjectType.folder);  
    itemCreateInfo.set_leafName(folderName);  
    this.oListItem = oList.addItem(itemCreateInfo);  
    this.oListItem.update();  
  
    clientContext.load(this.oListItem);  
    clientContext.executeQueryAsync(  
        Function.createDelegate(this, successHandler),  
        Function.createDelegate(this, errorHandler)  
    );
    //clientContext.load(website);
    //clientContext.executeQueryAsync(onRequestSucceeded, onRequestFailed);
}
function onRequestSucceeded() {
    alert('URL of the website: ' + website.get_url());
}
function onRequestFailed(sender, args) {
    alert('Error: ' + args.get_message());
}


var arrayBuffer;
function readFile(file,fileN,folderN)
{
    //Get File Input Control and read th file name
    //var element = document.getElementById("getFile");
    //var file = element.files[0];
    //var parts = element.value.split("\\");

    var fileName = fileN;
    var folderName= folderN;
    //Read File contents using file reader
    var reader = new FileReader();
    reader.onload = function(e)
    {
        uploadFile(e.target.result, fileName,folderName);
        return 1
    }
    reader.onerror = function(e)
    {
        alert(e.target.error);
    }
    reader.readAsArrayBuffer(file);
}
var attachmentFiles;
function createFolder(folderName)
{
    url="/sites/CC140991/";
    var clientContext = new SP.ClientContext.get_current();;
    var oWeb = clientContext.get_web();
    var oList = oWeb.get_lists().getByTitle('Documents');

    itemCreateInfo = new SP.ListItemCreationInformation();  
    itemCreateInfo.set_underlyingObjectType(SP.FileSystemObjectType.folder);  
    itemCreateInfo.set_leafName(folderName);  
    this.oListItem = oList.addItem(itemCreateInfo);  
    this.oListItem.update();  
  
    clientContext.load(this.oListItem);  
    clientContext.executeQueryAsync(  
        Function.createDelegate(this, successHandler),  
        Function.createDelegate(this, errorHandler)  
    );

}
function uploadFile(arrayBuffer, fileName, folderName)
{
    var clientContext = new SP.ClientContext();
    var oWeb = clientContext.get_web();
    var oList = oWeb.get_lists().getByTitle('Documents');
    var bytes = new Uint8Array(arrayBuffer);
    var i, length, out = '';
    for (i = 0, length = bytes.length; i < length; i += 1)
    {
        out += String.fromCharCode(bytes[i]);
    }
    var base64 = btoa(out);
    var createInfo = new SP.FileCreationInformation();
    //createInfo.set_content(base64);
    createInfo.Content= bytes;
    createInfo.set_url(fileName);
    myFolder = oWeb.getFolderByServerRelativeUrl('/sites/CC140991/Documents/' + folderName + '/');
    var uploadedDocument = myFolder.get_files().add(createInfo);
    clientContext.load(uploadedDocument);
    clientContext.executeQuery();
    //return clientContext.executeQueryAsync(QuerySuccess, QueryFailure);
    
    /* 
    //Get Client Context,Web and List object.
    var clientContext = new SP.ClientContext();
    var oWeb = clientContext.get_web();
    var oList = oWeb.get_lists().getByTitle('Documents');
    //Convert the file contents into base64 data
    var bytes = new Uint8Array(arrayBuffer);
    var i, length, out = '';
    for (i = 0, length = bytes.length; i < length; i += 1)
    {
        out += String.fromCharCode(bytes[i]);
    }
    var base64 = btoa(out);
    //Create FileCreationInformation object using the read file data
    var createInfo = new SP.FileCreationInformation();
    createInfo.set_content(base64);
    createInfo.set_url(fileName);
    createInfo.set_overwrite(true);
    myFolder = oWeb.getFolderByServerRelativeUrl('/sites/CC140991/Documents/' + folderName + '/');
    //Add the file to the library
    
    var uploadedDocument = myFolder.get_files().add(createInfo);
    //var uploadedDocument = oList.get_rootFolder().get_files().add(createInfo)
    //var uploadedDocument = oList.get_rofolder("My new folder").get_files().add(createInfo)
    //Load client context and execcute the batch
    clientContext.load(uploadedDocument);
    return clientContext.executeQueryAsync(QuerySuccess, QueryFailure);    
   */
}
function successHandler() {  
    console.log( "Go to the " +  
    "<a href='../Lists/Shared Documents'>document library</a> " +  
    "to see your new folder.");
    
}  

function errorHandler() {  
    console.log( "Request failed: " + arguments[1].get_message() );  
        
}; 
function QuerySuccess()
{
    console.log('File Uploaded Successfully.');
    bandFileUp=true;
}

function QueryFailure(sender, args)
{
    console.log('Request failed with error message - ' + args.get_message() + ' . Stack Trace - ' + args.get_stackTrace());
    bandFileUp="error";
}

