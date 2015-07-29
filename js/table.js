"use strict";
//==========================================================================================
// Matrix Item (cell)
function MatrixItem( data ) {
    this.security_profile_id = ko.observable( data.security_profile_id );
    this.sp_setting_id       = ko.observable( data.sp_setting_id );
    this.value               = ko.observable( data.value );
}

//==========================================================================================
// Matrix Row
function MatrixRow( data ) {
    var self = this;

    self.sp_settings_id = ko.observable( data.sp_settings_id );
    self.values         = ko.observableArray( [] );

    // Set Values
    data.values.forEach( function( item ) {
        self.values.push( new MatrixItem( item ) )
    })
}

//==========================================================================================
// Row table
function SpSetting( data, matrix, parent ) {
    var self = this;

    self._parent     = parent;
    self.groupName   = parent.name ;

    self.id          = ko.observable( data.id );
    self.uid         = ko.observable( data.uid );
    self.title       = ko.observable( data.title );
    self.description = ko.observable( data.description );
    self.position    = ko.observable( data.position );

    self.disable_code = ko.observable( data.disable_code );

    self.matrix = ko.observableArray( [] );

    //Set matrix
    matrix.forEach( function ( item ) {
        if(item.sp_settings_id == self.id() ){
            self.matrix.push( new MatrixRow( item ) );
        }
    });
}

// Clone
SpSetting.prototype.clone = function () {
    var self = this,
        _data   = ko.toJS( this ),
        _matrix = ko.toJS( this.matrix ),
        _clone  = new SpSetting( _data, _matrix, this._parent );

    setTimeout( function() {
        self._parent.removeSettings( self );
    }, 0);

    return _clone;
};

//==========================================================================================
// Security Profiles Item
function SecurityProfilesItem( data ) {
    var self = this;

    self.changes_key = ko.observable( data.changes_key );
    self.created_at  = ko.observable( data.created_at );
    self.creator_id  = ko.observable( data.creator_id );
    self.id          = ko.observable( data.id );
    self.is_deleted  = ko.observable( data.is_deleted );
    self.is_inherit  = ko.observable( data.is_inherit );
    self.name        = ko.observable( data.name );
    self.partner_id  = ko.observable( data.partner_id );
    self.position    = ko.observable( data.position );
    self.updated_at  = ko.observable( data.updated_at );
    self.updater_id  = ko.observable( data.updater_id );
    self.with_cloned = ko.observable( data.with_cloned );
}

//==========================================================================================
// Settings Groups Item
function SettingsGroupsItem( data, matrix ) {
    var self = this;

    self.id                  = ko.observable( data.id );
    self.name                = ko.observable( data.name );
    self.position            = ko.observable( data.position );

    self.is_editable         = ko.observable( data.is_editable );
    self.is_move_item_to_me  = ko.observable( data.is_move_item_to_me );
    self.is_move_item_to_out = ko.observable( data.is_move_item_to_out );
    self.is_sort_items       = ko.observable( data.is_sort_items );
    self.is_sort_self        = ko.observable( data.is_sort_self );

     //Sortable or Draggable
    self.settingsGroupsTemplate = ko.observable( self.is_sort_items() ? 'spSettingsSortable' : 'spSettingsDraggable' );

    //is_move_item_to_out
    self.containment = ko.observable( self.is_move_item_to_out() ? 'parent' : '#'+self.id() );

    self.sp_settings = ko.observableArray( [] );

    // Set Settings
    data.sp_settings.forEach( function ( item ) {
        self.sp_settings.push( new SpSetting( item, matrix, self  ) );
    });

    // Selected item
    self.selected = ko.observable();

    // events
    self.clear = function ( data ) {
        if ( data === self.selected() ) {
            self.selected(null);
        }

        if ( data.name === "" ) {
            self.sp_settings.remove(data);
        }
    };

    self.getIdSettings = function () {
        return self.sp_settings().length;
    };

    self.removeSettings = function ( data ) {
        self.sp_settings.remove( data );
    };

    self.isSelected = function ( Settings ) {
        return Settings === self.selected();
    };
}

//==========================================================================================
// Model
function ViewModel() {
    var self = this;

    self.sGroups          = ko.observableArray( [] );
    self.sGroupsNoSort    = ko.observableArray( [] );
    self.securityProfiles = ko.observableArray( [] );

    self.lastAction = ko.observable();
    self.lastError  = ko.observable();

    //action
    self.updateLastAction = function ( arg ) {
        if ( arg.item.title ) {
            if ( arg.sourceParent ) {
                self.lastAction("Moved " + arg.item.title() + " from " + arg.sourceParent()[0].groupName() + " (seat " + (arg.sourceIndex + 1) + ") to " + arg.targetParent()[0].groupName() + " (seat " + (arg.targetIndex + 1) + ")");
            } else {
                self.lastAction("Moved " + arg.item.title() + " from " + arg.item.groupName() + " (seat " + (arg.sourceIndex) + ") to " + arg.targetParent()[0].groupName() + " (seat " + (arg.targetIndex + 1) + ")");
            }
        } else {
            self.lastAction("Moved " + arg.item.name() + " from seat " + (arg.sourceIndex + 1) + " to seat " + (arg.targetIndex + 1) + "");
        }
    };

    //verify that
    this.verifyAssignments = function( arg ) {
        var gender, found,
            parent = arg.targetParent;

    };

    //Load Settings Groups data
    self.loadSettingsGroups = function ( data, matrix ) {
        self.sGroupsNoSort( [] );
        self.sGroups( [] );

        data.forEach( function ( group ) {

            if(!group.is_sort_self){
                self.sGroupsNoSort.push( new SettingsGroupsItem( group, matrix ) )
            }else{
                self.sGroups.push( new SettingsGroupsItem( group, matrix ) )
           }

        });
        return self
    };

    //Load Security Profiles data
    self.loadSecurityProfiles = function ( data ) {
        self.securityProfiles( [] );

        data.forEach( function( sp_item ) {
            self.securityProfiles.push( new SecurityProfilesItem( sp_item ) );
        });
        return self
    };
}

//==========================================================================================
//Table plugin costum bindings
ko.bindingHandlers.table = {
    init: function( element, valueAccessor, allBindings, viewModel, bindingContext ) {
        var $Table = $( element ),
            options = {
                width: valueAccessor().width,
                height: valueAccessor().height,
                fixHeader: valueAccessor().fixHeader
            };

        $Table.Table( options );
    },
    update: function( element, valueAccessor, allBindings, viewModel, bindingContext ) {
        var $Table = $( element );

        setTimeout( function() {
            $Table.Table('refresh');
        }, 0);

        // Triggers
        viewModel.sp_settings();
        bindingContext.$root.securityProfiles();
        bindingContext.$root.sGroups();

        //Refresh after render
        ko.bindingHandlers.sortable.afterRender = function () {
            $Table.Table('refresh');
            $Table.Table('showMask');
            //demo
            setTimeout(function () {
                $Table.Table('hideMask');
            }, 100);
        };

        //control visibility, give element focus, and select the contents (in order)
        ko.bindingHandlers.visibleAndSelect = {
            update: function ( element, valueAccessor ) {
                ko.bindingHandlers.visible.update( element, valueAccessor );
                if ( valueAccessor() ) {
                    setTimeout( function () {
                        $(element).find("input").focus().select();
                        $Table.Table('refresh');
                    }, 0); //new tasks are not in DOM yet
                }
            }
        };
    }
};

ko.bindingHandlers.flash = {
    init: function( element ) {
        $( element ).hide();
    },
    update: function( element, valueAccessor ) {
        var value = ko.utils.unwrapObservable( valueAccessor()),
            $element = $( element );
        if ( value ) {
            $element.stop().hide().text( value ).fadeIn( function() {
                clearTimeout( $element.data("timeout") );
                $element.data("timeout", setTimeout( function() {
                        $element.fadeOut();
                        valueAccessor();
                    }, 3000)
                );
            });
        }
    },
    timeout: null
};

var wscrolltop = 0, heightItem,  widthItem;

ko.bindingHandlers.sortable.options = {
    connectToSortable: ".settings-groups",
    appendTo: "body",
//      revert: 100,
    placeholder: "ui-sortable-placeholder",
    helper: 'clone',
    opacity: 0.8,
    zIndex: 9999,
    cursor: "move",
    forcePlaceholderSize: true,
    start: function ( event, ui ) {
        //fix top helper
        wscrolltop = $(window).scrollTop();
        heightItem = $(this).outerHeight( true );
        widthItem  = ui.item.outerWidth( true );

        //set no-drop style
        if ( !$(this).parents('.accordion-group').hasClass('no-drop') ) {
            $('.no-drop').addClass('active');
        }
    },
    stop: function ( event, ui ) {
        $('.no-drop').removeClass('active');
    },
    sort: function ( event, ui ) {
        //fix size header   //fix top helper
        if( ui.placeholder.parents().hasClass('header-rules') ) {
            ui.placeholder.height( heightItem - 4 );
            ui.placeholder.width( widthItem - 4 );
            ui.helper.css({'top' : ui.position.top + wscrolltop + 'px', 'height': heightItem + 'px'});
        }
    },
    cancel: '.noSort'
};

ko.bindingHandlers.draggable.options = {
    connectToSortable: ".settings-groups",
    appendTo: "body",
//      revert: 100,
    placeholder: "ui-sortable-placeholder",
    helper: 'clone',
    opacity: 0.8,
    zIndex: 9999,
    cursor: "move",
    forcePlaceholderSize: true,
    start: function ( event, ui ) {
        //fix top helper
        wscrolltop = $(window).scrollTop();
        heightItem = $(this).outerHeight( true );
        widthItem  = $(this).outerWidth( true );
        //set no-drop style
        if ( !$(this).parents('.accordion-group').hasClass('no-drop') ) {
            $('.no-drop').addClass('active');
        }
    },
    stop: function ( event, ui) {
        $('.no-drop').removeClass('active');
    }
};