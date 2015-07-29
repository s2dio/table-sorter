(function ($) {
    "use strict";

    function Table( element, options ) {
        var $element = $( element );

        this.$element    = $element;
        this.options     = $.extend( {}, $.fn.select.defaults, options );
        this.rules       = $element.find('.rules');
        this.header      = $element.find('.header-rules');
        this.headerClone = $element.find('.header-rules.clone');
        this.title       = $element.find('.name-rules');
        this.rows        = $element.find('.matrix-rules');
        this.mask        = $('.sortable-mask');

        // Initialization
        this.init();
    }

    Table.prototype = {
        init: function () {
            var self = this;

            self.mask.hide();

            if ( self.options.height
                && self.options.width
                && self.options.height !== '100%'
                && self.options.width !== '100%' )
            {
                self.$element.css({
                    width: self.options.width,
                    height: self.options.height,
                    overflow: 'auto'
                });
            }

            if ( self.options.fixHeader ) {
                self.headerPosition();
            }

            //Set size
            self.refresh();
            self.setHeightTitle();
        },

        headerPosition: function () {
            var self = this;

            self.rows.css({
                'position': 'absolute',
                'top': 0
            });

            self.$element.scroll( function () {
                var scrollTop = $(this).scrollTop(),
                    scrollLeft = $(this).scrollLeft();

                self.headerClone.css('top', scrollTop);

                self.title.find('.Row').first().css('top', scrollTop);

                self.title.css({
                    'left': scrollLeft
                });
            });
        },

        setHeightRows: function () {
            var self = this,
                heightHeaderTile = self.title.find('.Row.Title').outerHeight( true );

            self.title.find('.Row').each( function ( index ) {
                var _h = $(this).outerHeight(true);

                self.rows.find('.Table .Row').eq( index ).outerHeight( _h );
            });

            self.title.css({
                'padding-top': heightHeaderTile
            });
        },

        setHeightTitle: function () {
            var self = this,
                heightHeaderTitle = self.title.find('.Row.Title').outerHeight(true);

            self.mask.css({
                'top': heightHeaderTitle
            });

            self.headerClone.outerHeight( heightHeaderTitle )
                            .find('.Cell').height( heightHeaderTitle );
        },

        setWidthRows: function () {
            var self = this;

            self.headerClone.find('.Cell').each( function ( index ) {
                var widthHeaderTile = $(this).outerWidth( true );

                self.rows.find('.Row .Cell:nth-child(' + ( index + 1 ) + ')').css({
                    'min-width': widthHeaderTile
                })
            });

            if ( self.options.fixHeader ) {
                self.rows.css({
                    'margin-left': self.title.width()
                });
            }

            self.headerClone.css({
                'left': self.title.width()
            });
        },

        setWidthRules: function () {
            this.rules.width( this.title.width() + this.rows.width() );
        },

        setWidthTitle: function () {
            this.title.find('.Row').width( this.title.width() )
        },

        showMask: function () {
            this.mask.show();
        },

        hideMask: function () {
            this.mask.hide();
        },

        refresh: function () {
            this.setHeightRows();
            this.setWidthRows();
            this.setWidthRules();
            this.setWidthTitle();
            this.setWidthTitle();
        }
    };

    $.fn.Table = function ( option, value ) {
        var methodReturn;

        var $set = this.each( function () {
            var $this   = $( this ),
                data    = $this.data('Table'),
                options = typeof option === 'object' && option;

            if ( !data ) {
                $this.data('Table', (data = new Table(this, options)));
            }
            if ( typeof option === 'string' ) {
                methodReturn = data[ option ]( value );
            }
        });

        return ( methodReturn === undefined ) ? $set : methodReturn;
    };

    $.fn.Table.defaults = {};
    $.fn.Table.Constructor = Table;
})( jQuery );