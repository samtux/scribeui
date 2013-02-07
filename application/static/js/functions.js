function displayWorkspaces(select){
    $.post($SCRIPT_ROOT + '/_get_ws', {
    }, function(workspaces) {
        if(workspaces){
            var workspaceSelect =  $('#' + select);
            for(ws in workspaces){
               workspaceSelect.append($("<option></option>").attr("value", workspaces[ws]).text(workspaces[ws])); 
            }
        }
    });
}

function openNewWorkspaceWindow(options){
    $("#createws-form").dialog({
        autoOpen: false,
	resizable: false,
        height: 260,
        width: 300,
        modal: true,
        buttons: {
            "Create": function() {
                var name = $("#newws-name").val();
		var password = $("#newws-password").val();
                options["password"] = password;
                
                if(_workspace){
                    _workspace.close();
                }

		_workspace = new Workspace(name, options)

		_workspace.create();
                $(this).dialog("close");
            },
            Cancel: function() {
                $(this).dialog("close");
            }
        },
        close: function() {}
    }).dialog("open");
}

function deleteWorkspace(options){
    var msg = 'Are you sure you want to delete this workspace?';
    var div = $("<div>" + msg + "</div>");

    var name = $("#" + options.workspaceSelect).val();
    if(name != null){
        div.dialog({
            title: "Confirm",
            resizable: false,
            buttons: [{
                 text: "Yes",
                 click: function () {
                    var name = $("#" + options.workspaceSelect).val();
                    var password = $("#" + options.workspacePassword).val();

                    if(_workspace && _workspace.name == name){
                        _workspace.destroy(_workspace.close);
                    } else{
                        var workspace = new Workspace(name, options);
                        workspace.destroy();
                    }

                    div.dialog("close");
                 }
            },
            {
                text: "No",
                click: function () {
                    div.dialog("close");
                }
            }]
        });
    }
}

function openWorkspace(options){
    var name = $("#" + options.workspaceSelect).val();
    var password = $("#" + options.workspacePassword).val();
    
    options["password"] = password;

    if(_workspace){
        _workspace.close();
    }

    _workspace = new Workspace(name, options);
    _workspace.open();
}

function openNewMapWindow(){
    displayTemplates("templates");
    displayTemplates("");

    $("#createmap-form").dialog({
        autoOpen: false,
	resizable: false,
        width: 420,
        modal: true,
        buttons: {
            "Create": function() {
                var name = $("#newmap-name").val();
                var type = $("#newmap-type option:selected").val();
		        var template = $("#newmap-template option:selected").val();
                var templateLocation = $("#newmap-workspace-select").val();
                var locationPassword = $("#newmap-workspace-password").val();
                var description = $("#newmap-description").val();

		        var map = new Map(name, {
                    "type": type,
                    "description": description,
                    "workspace": _workspace,
                    "template": template,
                    "templateLocation": templateLocation ? templateLocation : "",
                    "locationPassword": locationPassword ? locationPassword : ""
                });

		        map.create();
                $(this).dialog("close");
            },
            "+": function(){
                $("#newmap-ws").removeClass("hidden");
                displayTemplates("templates");
                $("#newmap-workspace-select").empty();
                $("#newmap-workspace-select").append($("<option></option>").attr("value", " ").text(" "));
                displayWorkspaces("newmap-workspace-select");
                $("#newmap-workspace-select").unbind('blur');
                $("#newmap-workspace-select").bind('blur', function(){
                    var password = $("#newmap-workspace-password").val();
                    var workspaceSelect = $("#newmap-workspace-select").val()
                    displayTemplates("templates");
                    displayTemplates(workspaceSelect);  
                });
                
            },
            Cancel: function() {
                $("#newmap-ws").addClass("hidden");
                $(this).dialog("close");
            }
        },
        close: function() {
            $("#newmap-ws").addClass("hidden");
        }
    }).dialog("open");
}

function displayTemplates(ws_name){
    $("#newmap-template").empty();
    $.post($SCRIPT_ROOT + '/_get_templates', {
        ws_name: ws_name
    }, function(templates) {
        if(templates){
            for(temp in templates){
                $("#newmap-template").append($("<option></option>").val(templates[temp]).text(templates[temp]));
            }
        }
    });
}

function openMap(){
    var name = $("#map-table .map-selected").html();
    var map = _workspace.getMapByName(name);
    if(map){
        map.open();
    }
}

function deleteMap(){
    var msg = 'Are you sure you want to delete this map?';
    var div = $("<div>" + msg + "</div>");
    
    var name = $("#map-table .map-selected").html();
    if(name != null){
        div.dialog({
            title: "Confirm",
            resizable: false,
            buttons: [{
                 text: "Yes",
                 click: function () {
                    
                    var map = _workspace.getMapByName(name);
                    map.workspace = _workspace;

                    if(_workspace.openedMap == map){
                        map.destroy(map.close);
                    } else{
                        map.destroy();
                    }

                    div.dialog("close");
                }
            },
            {
                text: "No",
                click: function () {
                    div.dialog("close");
                }
            }]
        });
    }
}

function exportMap(){
     var name = $("#map-table .map-selected").html();
     if (name){
         $("#exportmap-form").dialog({
            autoOpen: false,
	        resizable: false,
            //height: 240,
            width: 300,
            modal: true,
            buttons: {
                "Export": function() {
                    var checkBoxes = $("input[name='exportComponents']");
                    var components = {};

                    $.each(checkBoxes, function() {
                        if ($(this).attr('checked')){
                            components[this.value] = 1;    
                        } else {
                            components[this.value] = 0;
                        }
                    });
            
                    var mapToExport = new Map(name);

                    var self = this;
                    mapToExport.exportSelf(components["publicData"], components["privateData"], function(){$(self).dialog("close");})
                    
                },
                Cancel: function() {
                    $(this).dialog("close");
                }
            },
            close: function() {}
        }).dialog("open");
    }        
}

function createNewGroup(){
    $("#creategroup-form").dialog({
        autoOpen: false,
	resizable: false,
        height: 180,
        width: 300,
        modal: true,
        buttons: {
            "Create": function() {
                var name = $("#newgroup-name").val();

		_workspace.openedMap.createGroup(name);
                $(this).dialog("close");
            },
            Cancel: function() {
                $(this).dialog("close");
            }
        },
        close: function() {}
    }).dialog("open");
}

function deleteGroup(){
    var name = $("#" + _workspace.groupSelect).val();
    _workspace.openedMap.removeGroup(name);
}

function openGroupOrderWindow(){
    _workspace.openedMap.displayGroupsIndex();
    $("#grouporder-form").dialog({
        autoOpen: false,
	resizable: false,
        height: 300,
        width: 300,
        modal: true,
        buttons: {
            "Apply": function() {
                _workspace.openedMap.updateGroupOrder();
                $(this).dialog("close");
            },
            "+": function(){
                var group = $("#" + _workspace.groupTable + " td.map-selected");
                var bumped = $("#" + _workspace.groupTable + " td.map-selected").parents().prev().find("td");
                
                var groupName = group.text();
                var bumpedName = bumped.text();

                if(groupName && bumpedName){
                    _workspace.openedMap.raiseGroupIndex(groupName);

                    bumped.text(groupName);
                    group.text(bumpedName);

                    group.removeClass("map-selected");
	            bumped.addClass("map-selected");
                }
            },
            "-": function(){
                var group = $("#" + _workspace.groupTable + " td.map-selected");
                var bumped = $("#" + _workspace.groupTable + " td.map-selected").parents().next().find("td");
                
                var groupName = group.text();
                var bumpedName = bumped.text();

                if(groupName && bumpedName){
                    _workspace.openedMap.lowerGroupIndex(groupName);

                    bumped.text(groupName);
                    group.text(bumpedName);

                    group.removeClass("map-selected");
	            bumped.addClass("map-selected");
                }
                
            },
            Cancel: function() {
                $(this).dialog("close");
            }
        },
        close: function() {}
    }).dialog("open");
}

function displayDataBrowser(){
    if(_workspace){
        if(_workspace.openedMap){
            _workspace.openedMap.openDataBrowser();
        }
    }
}

function zoomToPOI(){
    if(_workspace){
        if(_workspace.openedMap){
            var name = $("#" + _workspace.poiSelect).val();
            var poi = _workspace.getPointOfInterestByName(name);
            poi.zoomTo();
        }
    }    
}

function addPOI(){
     if(_workspace){
        if(_workspace.openedMap){
            $("#addpoi-form").dialog({
                autoOpen: false,
	        resizable: false,
                height: 180,
                width: 300,
                modal: true,
                buttons: {
                    "Add": function() {
                        var name = $("#newpoi-name").val();
		        _workspace.addPointOfInterest(name);
                        $(this).dialog("close");
                    },
                    Cancel: function() {
                        $(this).dialog("close");
                    }
                },
                close: function() {}
            }).dialog("open");
        }
    } 
}

function unregisterDebug(){
    if(_workspace.openedMap.OLMap != null){
        _workspace.openedMap.OLMap.events.unregister('moveend', _workspace.openedMap.OLMap, onMapMoveEnd);
    }
}

function registerDebug(){
    if(_workspace.openedMap.OLMap != null){
         _workspace.openedMap.OLMap.events.on({
	     "moveend": onMapMoveEnd
         });
     }
}

function clearDebug(){
    $('#txt-debug').val("");
    $.getJSON($SCRIPT_ROOT + '/_clear_debug', {
    }, function(data) {
    });
}

function displayDebug(){
    if($('.olTileImage').filter(function(){ return this.style && this.style.visibility === 'hidden' }).length > 0){
	onMapMoveEnd();
    }else{
       _workspace.openedMap.getDebug();
    }
}


function onMapMoveEnd(){
    setTimeout(function(){displayDebug()},500);
}
