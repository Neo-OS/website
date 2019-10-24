document.addEventListener('DOMContentLoaded', () => {
    // Get all "navbar-burger" elements
    const $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0);
    // Check if there are any navbar burgers
    if ($navbarBurgers.length > 0) {
        // Add a click event on each of them
        $navbarBurgers.forEach(el => {
            el.addEventListener('click', () => {
                // Get the target from the "data-target" attribute
                const target = el.dataset.target;
                const $target = document.getElementById(target);
                // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
                el.classList.toggle('is-active');
                $target.classList.toggle('is-active');
            }
            );
        }
        );
    }
}
);

// dropdown menu
document.addEventListener('DOMContentLoaded', function () {

    // Dropdowns
    var $selects = getAll('.select');
    if ($selects.length > 0) {
        $selects.forEach(function ($el) {
            $el.addEventListener('click', function (event) {
                event.stopPropagation();
                $el.classList.toggle('is-active');
                //const selection = ['kernel', 'arch', 'release', 'repo'];
                var kernel = showSelected('kernel');
                var arch = showSelected('arch');
                var repo = showSelected('repo');
                var release = showSelected('release');
                var q = getQuery();
                var link = kernel + arch + release + repo + q;
                var link = link.slice(0, -1);
                document.getElementById("searchBtn").setAttribute("href", "/packages?" + link);
            });
        });
    }

    // Functions
    function getAll(selector) {
        return Array.prototype.slice.call(document.querySelectorAll(selector), 0);
    }

    function showSelected(item) {
        var selector = document.getElementById(item);
        var value = selector[selector.selectedIndex].value;
        if (value === "any") {
            return '';
        } else {
            return item + "=" + value + "&";
        }
    }
});

// Get Query
function getQuery() {
    var x = document.getElementById("Search").value;
    if (x === null || x.trim() === '') {
        return '';
    } else {
        return "q=" + x + "&";
    }
}

registerListener('load', setLazy);
registerListener('load', lazyLoad);
registerListener('scroll', lazyLoad);

var lazy = [];

function setLazy() {
    lazy = document.getElementsByClassName('lazy');
}

function lazyLoad() {
    for (var i = 0; i < lazy.length; i++) {
        if (isInViewport(lazy[i])) {
            if (lazy[i].getAttribute('data-src')) {
                lazy[i].src = lazy[i].getAttribute('data-src');
                lazy[i].removeAttribute('data-src');
            }
        }
    }

    cleanLazy();
}

function cleanLazy() {
    lazy = Array.prototype.filter.call(lazy, function (l) { return l.getAttribute('data-src'); });
}

function isInViewport(el) {
    var rect = el.getBoundingClientRect();

    return (
        rect.bottom >= 0 &&
        rect.right >= 0 &&
        rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.left <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

function registerListener(event, func) {
    if (window.addEventListener) {
        window.addEventListener(event, func)
    } else {
        window.attachEvent('on' + event, func)
    }
}