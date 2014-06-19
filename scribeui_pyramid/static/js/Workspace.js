function Workspace(name, options){
    this.name = name;
    
    this.maps = [];

    this.selectedMap = null;

    if(options){
    this.password = options.password ? options.password : this.password;
        this.workspaceSelect = options.workspaceSelect ? options.workspaceSelect : null;
        this.workspaceManage = options.workspaceManage ? options.workspaceManage : null;
        this.mapList = options.mapList ? options.mapList : null;
        this.workspacePassword = options.workspacePassword ? options.workspacePassword : null;
        this.mapDiv = options.mapDiv ? options.mapDiv : null;
        this.mapTable = options.mapTable ? options.mapTable : null;
        this.mapActions = options.mapActions ? options.mapActions : null;
        this.mapDescription = options.mapDescription ? options.mapDescription : null;
        this.groupSelect = options.groupSelect ? options.groupSelect : null;
        this.groupOl = options.groupOl ? options.groupOl : null;
        this.poiSelect = options.poiSelect ? options.poiSelect : null;
        this.dataDiv = options.dataDiv ? options.dataDiv : null;
        this.logTextarea = options.logTextarea ? options.logTextarea : null;
        this.resultTextarea = options.resultTextarea ? options.resultTextarea : null;
        this.debugTextarea = options.debugTextarea ? options.debugTextarea : null;
        this.scaleLevelDiv = options.scaleLevelDiv ? options.scaleLevelDiv : null;
        this.popupWidth = options.popupWidth ? options.popupWidth : null;
        this.popupHeight = options.popupHeight ? options.popupHeight : null;
    }

    this.maps = []

    this.pointsOfInterest = [];
    this.openedMap = null;
};

Workspace.prototype.open = function(){
    this.getMaps();
	onWorkspaceOpened();
};

Workspace.prototype.createMap = function(data){
    var self = this;

    $.post($API + '/maps/new', data, function(response) {
        if(response.status == 1){
            self.open();
        }
    });
};

Workspace.prototype.cloneMap = function(data){
    var self = this;

    $.post($API + '/maps/clone', data, function(response) {
        selectors.gitCloneLogs().val(response.logs);
        if(response.status == 1){
            self.open();    
        }
    });
};

Workspace.prototype.deleteMap = function(map, callback){
    var self = this;

    $.post($API + '/maps/delete/' + map.id, {}, function(response) {
        if(response.status == 1){
            if(self.openedMap && map.name == self.openedMap.name){
                self.openedMap.close();
            }

            selectors.mapActions().hide();

            self.open();
        }
    });   
};
 
Workspace.prototype.create = function(){
    var self = this;
    $.post($SCRIPT_ROOT + '/_create_new_ws', {
        name: this.name,
        password: this.password
    }, function(status) {
        if(status == "1") {
            self.display();
            self.open();
        }else {
            alert(status);
        }
    });   
};

Workspace.prototype.getMaps = function(){
    var self = this;

    this.selectedMap = null;

    $.post($API + '/workspace/maps', {
        name: this.name,
    }, function(response) {
        if(response.status == 1){
            self.maps = [];

            $.each(response.maps, function(index, map){
                var options = $.extend(map, {
                    workspace: self
                });
                self.maps.push(new Map(options));
            });

            self.displayMaps(self.maps);

            //closeWorkspacePopup({"workspaceManage": self.workspaceManage});
            //$('#'+self.workspaceManage+' .workspace-errors').hide();    
        } /*else {
            $('#'+self.workspaceManage+' .workspace-errors').show();
            $('#'+self.workspaceManage+' .workspace-errors .error').html(data);
        }*/
    });
};

Workspace.prototype.getMapByName = function(name){
    for(var i = 0; i < this.maps.length; i++){
        if(this.maps[i].name == name){
            return this.maps[i];
        }
    }
    return null;
};

Workspace.prototype.getMapByID = function(id){
    for(var i = 0; i < this.maps.length; i++){
        if(this.maps[i].id == id){
            return this.maps[i];
        }
    }
    return null;
};

Workspace.prototype.getMapIndexByName = function(name){
    for(var i = 0; i < this.maps.length; i++){
        if(this.maps[i].name == name){
            return i;
            break;
        }
    }
    return null;
};

Workspace.prototype.getPointsOfInterest = function(callback){
    var self = this;
    $.post($SCRIPT_ROOT + '/_get_pois', {
    }, function(data) {
    if (data){
        var pois = [];
        $.each(data.pois, function(key, poi){
                var oPoi = new POI(poi.name, poi.lon, poi.lat, poi.scale);
                oPoi["workspace"] = self;
        pois.push(oPoi);
                
        });
            
            for(var i = 0; i < pois.length; i++){
            self.pointsOfInterest.push(pois[i]);
            }

        if(callback){
        callback.call(self)
        }
    }    
    });
};

Workspace.prototype.getPointOfInterestByName = function(name){
    for(var i = 0; i < this.pointsOfInterest.length; i++){
    if(this.pointsOfInterest[i].name == name){
        return this.pointsOfInterest[i];
        break;
    }
    }
    return null;
};

Workspace.prototype.addPointOfInterest = function(name){
    var self = this;

    var center = this.openedMap.OLMap.getCenter();
    var projection = this.openedMap.OLMap.getProjection();
    var lonLat = center.transform(new OpenLayers.Projection(projection.toUpperCase()), new OpenLayers.Projection("EPSG:4326"));
    var scale = this.openedMap.OLMap.getScale();

    var poi = new POI(name, lonLat.lon, lonLat.lat, scale);
    poi["workspace"] = this;

    $.post($SCRIPT_ROOT + '/_add_poi', {
        name: name,
        lon: lonLat.lon, 
        lat: lonLat.lat, 
        scale: scale
    }, function(status) {
    //self.pointsOfInterest.push(poi);
    });
    self.pointsOfInterest.push(poi);
    this.displayPointsOfInterest();
};

Workspace.prototype.displayMaps = function(maps){
    var self = this;

    this.clearMaps();

    selectors.mapActions().find('button').button('enable');
    selectors.mapsList().empty();

    $.each(maps, function(index, map){
        self.displayThumbnail(map);
    });

    selectors.mapsList().selectable({
        selected: function(e){
            var li = $(this).find(".ui-selected");
            self.selectedMap = self.getMapByName(li.text());

            if(self.selectedMap){
                self.selectedMap.displayDescription();    
            }

            if(li.find('.default-preview').length > 0){
                li.addClass('li-default-thumbnail');
            }  
        }
    });
};

Workspace.prototype.displayThumbnail = function(map){
    var li = $('<li>').addClass('map-preview');
    var image = $('<div>').addClass('map-preview-img').appendTo(li);
    var name = $('<span>').addClass('map-preview-name').text(map.name).appendTo(li);

    if(map.thumbnail_url){
        image.addClass('thumbnail-preview').css('background-image', 'url("' + map.thumbnail_url + '")');
    } else{
        image.addClass('default-preview');
    }
    selectors.mapsList().append(li);    
};

Workspace.prototype.displayPointsOfInterest = function(){
    this.clearPointsOfInterest();

    for(var i = 0; i < this.pointsOfInterest.length; i++){
       $("#" + this.poiSelect).append($("<option></option>").attr("value", this.pointsOfInterest[i].name).text(this.pointsOfInterest[i].name)); 
    }

    $("#" + this.poiSelect).trigger('chosen:updated');   
};

Workspace.prototype.display = function(){
    var select = $("#" + this.workspaceSelect);
    select.append($("<option></option>").attr("value", this.name).text(this.name));
    select.val(this.name);
};

Workspace.prototype.close = function(){
    if(this.openedMap){
        this.openedMap.close();
    }

    this.clearMaps();
    delete this;
};

Workspace.prototype.destroy = function(callback){
    var self = this;
    $.post($SCRIPT_ROOT + '/_delete_ws', {
        name: this.name,
        password: this.password
    }, function(status) {
        if(status == "1") {
            $("#" + self.workspaceSelect + " option[value=" + self.name + "]").remove();
            $('#'+self.workspacePassword).val('');
            if(callback){
                callback.call(self);
            }
            $("#" + self.workspaceSelect).trigger('chosen:updated');
        }else {
            alert(status);
        }
    });   
};

Workspace.prototype.clearMaps = function(){
    this.selectedMap = null;
    selectors.mapDescription().html('');
    selectors.mapActions().find('button').button('disable');
};

Workspace.prototype.clearPointsOfInterest = function(){
     $("#" + this.poiSelect).find("option").remove();
};