// 动画组件
var transitions = {
    isAnimating: false,
    curPage: "index-page", //存储当前页面的id
    nextPage: "", //存储下一页的id
    endCurrPage: false,
    endNextPage: false,
    animEndEventNames: {
        'WebkitAnimation': 'webkitAnimationEnd',
        'OAnimation': 'oAnimationEnd',
        'msAnimation': 'MSAnimationEnd',
        'animation': 'animationend'
    },
    back: function(curpage, nextpage, fn) {
        transitions.curPage = curpage;
        transitions.nextPage = nextpage;
        transitions.animation(10, fn);
    },
    next: function(curpage, nextpage, fn) {
        transitions.curPage = curpage;
        transitions.nextPage = nextpage;
        transitions.animation(9, fn);
    },
    skip: function(curpage, nextpage, fn) {
        transitions.curPage = curpage;
        transitions.nextPage = nextpage;
        transitions.resetPage($(".page"), $("#" + nextpage));
        if (fn) {
            fn.call();
        }
    },
    animation: function(animation, fn) {
        if (transitions.isAnimating) {
            return false;
        }
        transitions.isAnimating = true;

        var $currPage = $("#" + transitions.curPage); //获取当前面
        var $nextPage = $("#" + transitions.nextPage); //获取下一页
        $nextPage.addClass('page-current');

        var aniClass = transitions.get_aniClass(animation); //获取过渡效果

        var outClass = aniClass.outClass; //设置过渡效果
        var inClass = aniClass.inClass; //设置过渡效果

        animEndEventName = "animationend";
        // $currPage.addClass(outClass).on(animEndEventName, function() {
        //     $currPage.off(animEndEventName);
        //     transitions.endCurrPage = true;
        //     if (transitions.endNextPage) {
        //         transitions.onEndAnimation($currPage, $nextPage, fn);
        //     }
        // });
        $nextPage.addClass(inClass).on(animEndEventName, function() {
            $nextPage.off(animEndEventName);
            transitions.endNextPage = true;
            transitions.onEndAnimation($currPage, $nextPage, fn);

            // if (transitions.endCurrPage) {
            // transitions.onEndAnimation($currPage, $nextPage, fn);
            // }
        });
    },
    onEndAnimation: function($outpage, $inpage, fn) {
        transitions.endCurrPage = false;
        transitions.endNextPage = false;
        transitions.resetPage($outpage, $inpage, fn);
        transitions.isAnimating = false;
        transitions.curPage = transitions.nextPage;
    },

    resetPage: function($outpage, $inpage, fn) {
        var outpageOriginalClass = $outpage.attr('oriclass') || "page";
        var inpageOriginalClass = $inpage.attr('oriclass') || "page";
        
        $outpage.attr('class', outpageOriginalClass);
        $inpage.attr('class', inpageOriginalClass + ' page-current');
        if (typeof fn === "function") {
            fn();
        }
    },
    get_aniClass: function(animation) {
        var outClass = '',
            inClass = '';
        switch (animation) {
            case 9:
                outClass = 'pt-page-moveToLeftFade';
                inClass = 'pt-page-moveFromRightFade';
                break;
            case 10:
                outClass = 'pt-page-moveToRightFade';
                inClass = 'pt-page-moveFromLeftFade';
                break;
        }
        var ret = {
            outClass: outClass,
            inClass: inClass
        };
        return ret;
    }
};