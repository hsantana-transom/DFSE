'use strict';
SP.SOD.executeFunc('sp.js', 'SP.ClientContext', sharePointReady);
var bandFileUp=false;
jQuery(document).ready(function () {
    // Check for FileReader API (HTML5) support.
    if (!window.FileReader) {
      alert('This browser does not support the FileReader API.');
    }
  });
  /**
   * Creates a folder to store documents
   */
  function sharePointReady() {
    var url="/sites/CC140991/";
    var clientContext = new SP.ClientContext(url);
    //website = clientContext.get_web();
    var oWeb = clientContext.get_web();
    console.log(window.location.href);
    var res = window.location.href.split("/");
    var folderName= "Curso " + res[res.length-1] + "-" + res[res.length-2]; 
    var oList = oWeb.get_lists().getByTitle('Documents');

    var itemCreateInfo = new SP.ListItemCreationInformation();  
    itemCreateInfo.set_underlyingObjectType(SP.FileSystemObjectType.folder);  
    itemCreateInfo.set_leafName(folderName);  
    var oListItem = oList.addItem(itemCreateInfo);  
    oListItem.update();  
  
    clientContext.load(oListItem);  
    clientContext.executeQueryAsync(  
        Function.createDelegate(this, successHandler),  
        Function.createDelegate(this, errorHandler)  
    );
  }
  /**
   * message if the folder is created succesfully
   */
  function successHandler() {  
    console.log( "Go to the " +  
    "<a href='../Lists/Shared Documents'>document library</a> " +  
    "to see your new folder.");
    
 }  
/**
 * Message if the creation folder sends an error
 */
function errorHandler() {  
    console.log( "Request failed: " + arguments[1].get_message() );  
        
}; 
/**
 * Uplodas File
 * /You can upload files up to 2 GB with the REST API.
 * @param {*} fileN File name
 * @param {*} folder folder route
 */  
  function uploadFile(fileN,folder) {
    // Define the folder path for this example.
    var serverRelativeUrlToFolder = 'Documents/' + folder;
    $("body").css("cursor", "wait");
    // Get test values from the file input and text input page controls.
    var fileInput = jQuery('#getFile');
    var newName =fileN; // jQuery('#displayName').val();
    document.getElementById("bAprobar").disabled = true;
    document.getElementById("bGuardar").disabled = true;
    //document.getElementById("messageFile").innerText= "SUBIENDO...";
    // Get the server URL.
    var serverUrl = _spPageContextInfo.webAbsoluteUrl;
  
    // Initiate method calls using jQuery promises.
    // Get the local file as an array buffer.
    var getFile = getFileBuffer();
    getFile.done(function (arrayBuffer) {
      // Add the file to the SharePoint folder.
      var addFile = addFileToFolder(arrayBuffer);
      addFile.done(function (file, status, xhr) {
        // Get the list item that corresponds to the uploaded file.
        var getItem = getListItem(file.d.ListItemAllFields.__deferred.uri);
        getItem.done(function (listItem, status, xhr) {
          // Change the display name and title of the list item.
          var changeItem = updateListItem(listItem.d.__metadata);
          changeItem.done(function (data, status, xhr) {
            bandFileUp=true;
            document.getElementById("bAprobar").disabled = false;
            document.getElementById("bGuardar").disabled = false;
            $("body").css("cursor", "default");
            //document.getElementById("messageFile").innerText= "CARGADO EXITOSAMENTE!";
            //document.getElementById("bandFile").value= "true";
            localStorage.setItem('fileUp',true);
            
            //alert('file uploaded and updated');
            //return 1;
          });
          changeItem.fail(onError);
          
        });
        getItem.fail(onError);
        
      });
      addFile.fail(onError);
      
    });
    getFile.fail(onError);
    
    /**
     *  Get the local file as an array buffer.
     */
   
    function getFileBuffer() {
      var deferred = jQuery.Deferred();
      var reader = new FileReader();
      reader.onloadend = function (e) {
        deferred.resolve(e.target.result);
      }
      reader.onerror = function (e) {
        deferred.reject(e.target.error);
      }
      reader.readAsArrayBuffer(fileInput[0].files[0]);
      return deferred.promise();
    }
  
    /**
     * // Add the file to the file collection in the Shared Documents folder.
     * @param {*} arrayBuffer  file buffer
     */
    
    function addFileToFolder(arrayBuffer) {
      // Get the file name from the file input control on the page.
      var parts = fileInput[0].value.split('\\');
      var fileName = parts[parts.length - 1];
  
      // Construct the endpoint.
      var fileCollectionEndpoint = String.format(
              "{0}/_api/web/getfolderbyserverrelativeurl('{1}')/files" +
              "/add(overwrite=true, url='{2}')",
              serverUrl, serverRelativeUrlToFolder, fileName);
  
      // Send the request and return the response.
      // This call returns the SharePoint file.
      return jQuery.ajax({
          url: fileCollectionEndpoint,
          type: "POST",
          data: arrayBuffer,
          processData: false,
          headers: {
            "accept": "application/json;odata=verbose",
            "X-RequestDigest": jQuery("#__REQUESTDIGEST").val(),
            "content-length": arrayBuffer.byteLength
          }
      });
    }
    /**
     * Get the list item that corresponds to the file by calling the file's ListItemAllFields property.
     * @param {*} fileListItemUri string file information
     */
    function getListItem(fileListItemUri) {
      // Send the request and return the response.
      return jQuery.ajax({
        url: fileListItemUri,
        type: "GET",
        headers: { "accept": "application/json;odata=verbose" }
      });
    }
    /**
     * // Change the display name and title of the list item.
     * @param {*} itemMetadata file metadata
     */
    
    function updateListItem(itemMetadata) {
      // Define the list item changes. Use the FileLeafRef property to change the display name.
      // For simplicity, also use the name as the title.
      // The example gets the list item type from the item's metadata, but you can also get it from the
      // ListItemEntityTypeFullName property of the list.
      var body = String.format("{{'__metadata':{{'type':'{0}'}},'FileLeafRef':'{1}','Title':'{2}'}}",
          itemMetadata.type, newName, newName);
  
      // Send the request and return the promise.
      // This call does not return response content from the server.
      return jQuery.ajax({
          url: itemMetadata.uri,
          type: "POST",
          data: body,
          headers: {
            "X-RequestDigest": jQuery("#__REQUESTDIGEST").val(),
            "content-type": "application/json;odata=verbose",
            "content-length": body.length,
            "IF-MATCH": itemMetadata.etag,
            "X-HTTP-Method": "MERGE"
          }
      });
    }
  }
  /**
   * // Display error messages.
   * @param {*} error error message
   */
  
  function onError(error) {
    alert(error.responseText);
    document.getElementById("bAprobar").disabled = false;
    document.getElementById("bGuardar").disabled = false;
    document.getElementById("messageFile").innerText= "Error!";
    localStorage.setItem('fileUp',false);
    $("body").css("cursor", "default");
  }