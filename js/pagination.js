

//Pagination Settings
self.pageSize =  1000;
self.currentPageIndex = ko.observable(1);

self.totalPages = ko.computed(function() {
    var length = self.getIdSettings();
    var div = Math.floor(length / self.pageSize);
    div += length % self.pageSize > 0 ? 1 : 0;
    return div;
});


self.filteredSettings = ko.computed(function () {
    var startIndex = self.pageSize * (self.currentPageIndex() - 1);
    var endIndex = startIndex + self.pageSize;
    return self.Settings.slice(startIndex, endIndex);
});


self.hasPrevious = ko.computed(function() {
    return self.currentPageIndex() !== 1;
});

self.hasNext = ko.computed(function() {
    return self.currentPageIndex() !== self.totalPages();
});

self.next = function() {
    if(self.currentPageIndex() < self.totalPages()) {
        self.currentPageIndex(self.currentPageIndex() + 1);
    }
}

self.previous = function() {
    if(self.currentPageIndex() != 0) {
        self.currentPageIndex(self.currentPageIndex() - 1);
    }
}

