(function ($) {
  "use strict";
  window.jnews = window.jnews || {};
  window.jnews.webstories = window.jnews.webstories || {};
  var isJNewsLibrary = "object" === typeof jnews && "object" === typeof jnews.library,
    isTnsActive = "function" === typeof jnews.tns,
    Webstories = function (container) {
      var xhr = {},
      body = jnews.library.globalBody,
      bindWebstoriesModalEvent = function () {
        //Story modal on load event
        if (null !== iframe && null !== storyLoader) {
          jnews.library.addEvents(iframe, {
            load: function () {
              storyLoader.style.display = "none";
            },
          });
        }

        //Close story modal Event
        if (null !== modalCloseButton && null !== storyModal) {
          jnews.library.addEvents(modalCloseButton, {
            click: function () {
              closeStoryModal()
            },
          });
          document.addEventListener('keydown', function(event){
            if(event.key === "Escape"){
              closeStoryModal()
            }
          });
        }


        //Story navigation event
        if (null !== currentStoryItemIndex && null !== currentStoryItem) {
          //go to previous story
          if (null !== storyPrevButton) {
            jnews.library.addEvents(storyPrevButton, {
              click: function (event) {
                onChangeActiveStory(event);
              },
            });
          }

          //go to next story
          if (null !== storyNextButton) {
            jnews.library.addEvents(storyNextButton, {
              click: function (event) {
                onChangeActiveStory(event);
              },
            });
          }
        }
      },
      closeStoryModal = function() {
        if (null !== body.querySelector(".jw-modal")) {
          jnews.library.removeClass(body, "jw-modal-open");
          body.removeChild(storyModal);
          storyModal = null;
        }
      },
      onChangeActiveStory = function (event) {
        var goToItemIndex = event.target.getAttribute("data-to");
        if (goToItemIndex > 0 && goToItemIndex <= currentWebstoriesTotalItem) {
          var currentStoryParent = currentStoryItem.closest(".jnews-webstories"),
            goToStory = currentStoryParent.querySelectorAll(`[data-index="${goToItemIndex}"]`);
            webstoriesModalOnLoad(goToStory[0]);
        }
      },
      getSeenStoryList = function () {
        var seenStories = document.cookie.match(new RegExp("jnews-webstories" + "=([^;]+)"));
        seenStories && (seenStories = JSON.parse(seenStories[1]));
        return seenStories;
      },
      setSeenStoryList = function (seenStory = []) {
        var path = (jnewsoption.site_slug === undefined) ? '/' : jnewsoption.site_slug,
            domain = (jnewsoption.site_domain === undefined) ? window.location.hostname : jnewsoption.site_domain,
            seenStories = ["jnews-webstories", "=", JSON.stringify(seenStory), "; domain=",  domain, "; path=", path, ";"].join("");
        document.cookie = seenStories;
      },
      storyModal = null,
      storyModalButtons = null,
      modalCloseButton = null,
      storyNav = null,
      storyPrevButton = null,
      storyNextButton = null,
      storyNavigationInfoWrapper = null,
      storyNavigationInfoCurrent = null,
      storyNavigationInfoDivider = null,
      storyNavigationInfoTotal = null,
      storyContent = null,
      storyLoader = null,
      iframe = null,
      buildStoryModal = function () {
        if (null === storyModal) {
          storyModal = createElement({type:'div',classes:['jw-modal']})
          storyModalButtons = createElement({type:'div',classes:['jw-modal-buttons']})
          modalCloseButton = createElement({type:'button', classes:['jw-modal-close','fa','fa-times']})
          storyNav = createElement({type:'span',classes:['jw-modal-nav']})
          storyPrevButton = createElement({type:'button',classes:['jw-modal-nav-button','jw-modal-prev','fa','fa-angle-left']}) 
          storyNextButton = createElement({type:'button',classes:['jw-modal-nav-button','jw-modal-next','fa','fa-angle-right']})
          storyNavigationInfoWrapper = createElement({type:'span',classes:['jw-modal-nav-text']})
          storyNavigationInfoCurrent = createElement({type:'span',classes:['jw-modal-nav-current']})
          storyNavigationInfoDivider = createElement({type:'span',classes:['jw-modal-nav-divider']})
          storyNavigationInfoTotal = createElement({type:'span',classes:['jw-modal-nav-total']})
          storyContent = createElement({type:'div',classes:['jw-modal-content']})
          storyLoader = createElement({type:'div',classes:['jw-modal-loader','fa','fa-circle-o-notch','fa-spin']})
          iframe = createElement({type:'iframe',classes:['jw-modal-iframe']})

          jnews.library.addClass(body, "jw-modal-open");
          storyPrevButton.setAttribute("data-to", parseInt(currentStoryItemIndex) - 1);
          storyNextButton.setAttribute("data-to", parseInt(currentStoryItemIndex) + 1);
          storyNav.appendChild(storyPrevButton);
          storyNavigationInfoCurrent.innerHTML = currentStoryItemIndex;
          storyNavigationInfoDivider.innerHTML = "/";
          storyNavigationInfoTotal.innerHTML = currentWebstoriesTotalItem;
          storyNavigationInfoWrapper.appendChild(storyNavigationInfoCurrent);
          storyNavigationInfoWrapper.appendChild(storyNavigationInfoDivider);
          storyNavigationInfoWrapper.appendChild(storyNavigationInfoTotal);
          storyNav.appendChild(storyNavigationInfoWrapper);
          storyNav.appendChild(storyNextButton);
          storyModalButtons.appendChild(modalCloseButton);
          storyModalButtons.appendChild(storyNav);
          storyModal.appendChild(storyModalButtons);
          storyContent.appendChild(iframe);
          storyModal.appendChild(storyContent);
          storyModal.appendChild(storyLoader);
          body.appendChild(storyModal);
        }
      },
      attachStorySource = function(src) {
          if (null !== iframe) {
            iframe.setAttribute("src", src);
            iframe.src = src;
          }
          storyLoader.style.display = "block";
          storyPrevButton.setAttribute("data-to", parseInt(currentStoryItemIndex) - 1);
          storyNextButton.setAttribute("data-to", parseInt(currentStoryItemIndex) + 1);
          storyNavigationInfoCurrent.innerHTML = currentStoryItemIndex;
          storyNavigationInfoDivider.innerHTML = "/";
          storyNavigationInfoTotal.innerHTML = currentWebstoriesTotalItem;
          bindWebstoriesModalEvent();
      },
      createElement = function(options){
        if( options.type ){
          var createdElement = jnews.library.doc.createElement(options.type)
          if( 0 < options.classes.length ) {
            jnews.library.forEach( options.classes, function(className){
              jnews.library.addClass(createdElement, className)
            })
          }
          return createdElement;
        }
      },
      webstoriesOnLoad = function (options) {
        if (options) {
          var jnewsWebstories = options,
            webstoriesItems = jnewsWebstories.querySelectorAll(".jnews-webstories-item");
          webstoriesSliderEvent(jnewsWebstories);
          //Webstories item on click event
          if (webstoriesItems.length) {
            var seenStory = getSeenStoryList(),
                anyStorySeen = null !== seenStory ? true : false,
                storyEventStatus = {
                  dragged: false
                }

            jnews.library.forEach(webstoriesItems, function ($webstoriesitem) {
              if (anyStorySeen) {
                if (0 <= seenStory.indexOf($webstoriesitem.getAttribute("data-id"))) {
                  jnews.library.addClass($webstoriesitem, "seen");
                }
              }

              jnews.library.addEvents($webstoriesitem, {
                mousedown: function () {
                  //prevent story get clicked on drag
                  storyEventStatus.dragged = false
                },
              });

              jnews.library.addEvents($webstoriesitem, {
                mousemove: function () {
                  //prevent story get clicked on drag
                  storyEventStatus.dragged = true
                },
              });


              jnews.library.addEvents($webstoriesitem, {
                click: function () {
                var dragged = storyEventStatus.dragged
                    if (!dragged) {
                        webstoriesModalOnLoad($webstoriesitem);
                    }
                 },
              });
            });
          }
        }
      },
      currentStoryItemIndex = null,
      currentStoryItem = null,
      currentStoryItem = null,
      currentWebstoriesTotalItem = null,
      webstoriesModalOnLoad = function ($webstoriesitem) {
        var currentStoryItemId = $webstoriesitem.getAttribute("data-id"),
          currentElementParent = $webstoriesitem.closest(".jnews-webstories"),
          totalSiblingItemsTns = currentElementParent.children.length,
          seenStory = getSeenStoryList();

        buildStoryModal()

        currentWebstoriesTotalItem = totalSiblingItemsTns;
        currentStoryItemIndex = $webstoriesitem.getAttribute("data-index");
        currentStoryItem = $webstoriesitem;

        if (undefined === seenStory || null === seenStory) {
          setSeenStoryList([currentStoryItemId]);
        } else if (0 > seenStory.indexOf(currentStoryItemId)) {
        seenStory.push(currentStoryItemId);
          setSeenStoryList(seenStory);
        }

        $webstoriesitem.setAttribute("data-active-item", currentStoryItemIndex);

        $.post(jnews_ajax_url, { action: 'jnews_refresh_nonce', refresh_action_nonce: 'jnews_webstories_nonce' }).always(function (data) {
          //see #
          $.ajax({
            url: jnews_ajax_url,
            type: 'POST',
            dataType: 'json',
            data: {
              'id': currentStoryItemId,
              'nonce': data.jnews_nonce,
              'action': 'webstories_ajax',
            },
          }).success(function(result){
              attachStorySource(result.data);

          })
        })
        jnews.library.addClass($webstoriesitem, "seen");
      },
      webstoriesSliderEvent = function (ele) {

        var options = {
            container: ele,
            textDirection: jnewsoption.rtl == 1 ? "rtl" : "ltr",
            onInit: function (info) {
              if ("undefined" !== typeof info.nextButton) {
                jnews.library.addClass(info.nextButton, "tns-next");
              }
              if ("undefined" !== typeof info.prevButton) {
                jnews.library.addClass(info.prevButton, "tns-prev");
              }
            },
          },
          carouselType,
          defaultOption = (function (options) {
            var jcarouselDefault = {
                textDirection: "ltr",
                container: options.container,
                controls: false,
                controlsText: ['', ''],
                nav: false,
                loop: false,
                autoplay: false,
                gutter: 15,
                autoplayTimeout: 3000,
                animateOut: "tns-fadeOut",
                autoHeight: true,
                mouseDrag: true,
                responsive: false,
                edgePadding: 1,
                lazyload: false,
                lazyloadSelector: "img",
                mode: "carousel",
                speed: 300,
                onInit: false,
              },
              wrapper,
              showControls = jnews.library.hasClass(ele, "show-controls"),
              rtl = false,
              jegWrapper = jcarouselDefault.container.closest('.jeg_posts_wrap'),
              visibleItem = jcarouselDefault.container.getAttribute('data-visible-item')

              jcarouselDefault.gutter = jnews.library.hasClass(ele, "potrait") ? 13.8 : jcarouselDefault.gutter

            if ("undefined" !== typeof jnewsoption) {
              rtl = jnewsoption.rtl == 1;
            }
            if ("undefined" !== typeof jnewsgutenbergoption) {
              rtl = jnewsgutenbergoption.rtl == 1;
            }
            jcarouselDefault.textDirection = rtl ? "rtl" : "ltr";

            /*** webstories slider ***/
            if (!jnews.library.hasClass(ele, "list") && !jnews.library.hasClass(ele, "grid") ) {
              carouselType = 1;
              /* Fullwidth (column 12) */
              if (jnews.library.hasClass(ele, "jeg_col_12")) {
                jcarouselDefault.items = "undefined" === typeof jcarouselDefault.container.dataset.items ? 6 : parseInt(jcarouselDefault.container.dataset.items);
              }
              jcarouselDefault.controlsPosition = "bottom";
              if (jnews.library.hasClass(ele, "circle") || jnews.library.hasClass(ele, "square")) {
                //circle & square
                  if ( jnews.library.hasClass(ele, "jeg_col_4") ) {
                    jcarouselDefault.container = jegWrapper
                      jcarouselDefault.responsive = {
                        0: { items: 1 },
                        280: { items: 3 < visibleItem ? 3 : visibleItem, controls: false},
                        320: { items: 4 < visibleItem ? 4 : visibleItem, controls: false },
                        411: { items: 5 < visibleItem ? 5 : visibleItem, controls: false },
                        480: { items: 6 < visibleItem ? 6 : visibleItem, controls: false },
                        768: { items: 2 < visibleItem ? 2 : visibleItem, controls: showControls },
                        1024: { items: 3 < visibleItem ? 3 : visibleItem, controls: showControls },
                      }
                  } else if ( jnews.library.hasClass(ele, "jeg_col_6") || jnews.library.hasClass(ele, "jeg_col_8") ) {
                    jcarouselDefault.container = jegWrapper
                    if(!showControls) {
                      jcarouselDefault.responsive = {
                        0: { items: 1 },
                        280: { items: 3 < visibleItem ? 3 : visibleItem, controls: false },
                        320: { items: 4 < visibleItem ? 4 : visibleItem, controls: false },
                        411: { items: 5 < visibleItem ? 5 : visibleItem, controls: false },
                        480: { items: 6 < visibleItem ? 6 : visibleItem, controls: false },
                        768: { items: 4 < visibleItem ? 4 : visibleItem, controls: showControls },
                        1024: { items: 5 < visibleItem ? 5 : visibleItem, controls: showControls },
                      }
                    } else {
                      jcarouselDefault.responsive = {
                        0: { items: 1 },
                        280: { items: 3 < visibleItem ? 3 : visibleItem, controls: false },
                        320: { items: 4 < visibleItem ? 4 : visibleItem, controls: false },
                        411: { items: 5 < visibleItem ? 5 : visibleItem, controls: false },
                        480: { items: 6 < visibleItem ? 6 : visibleItem, controls: false },
                        768: { items: 3 < visibleItem ? 3 : visibleItem, controls: showControls },
                        1024: { items: 4 < visibleItem ? 4 : visibleItem, controls: showControls },
                      }
                    }
                  } else if (  jnews.library.hasClass(ele, "jeg_col_12") ) {
                    jcarouselDefault.responsive = {
                      0: { items: 1 },
                      280: { items: 3 < visibleItem ? 3 : visibleItem, controls: false },
                      320: { items: 4 < visibleItem ? 4 : visibleItem, controls: false },
                      411: { items: 5 < visibleItem ? 5 : visibleItem, controls: false },
                      480: { items: 6 < visibleItem ? 6 : visibleItem, controls: false },
                      768: { items: 8 < visibleItem ? 8 : visibleItem, controls: false},
                      1024: { items: 10 < visibleItem ? 10 : visibleItem, controls: showControls },
                      1366: { items: 13 < visibleItem ? 13 : visibleItem, controls: showControls } ,
                    }
                  }
              } else if (jnews.library.hasClass(ele, "potrait")) {
                if ( jnews.library.hasClass(ele, "jeg_col_4") ) {
                  jcarouselDefault.container = jegWrapper
                  jcarouselDefault.responsive = {
                    0: { items: 1 },
                    280: { items: 2 < visibleItem ? 2 : visibleItem, controls: false },
                    360: { items: 3 < visibleItem ? 3 : visibleItem, controls: false },
                    540: { items: 4 < visibleItem ? 4 : visibleItem, controls: false },
                    768: {  items: 1 < visibleItem ? 1 : visibleItem, fixedWidth: false, controls: showControls  },
                    1024: {  items: 2 < visibleItem ? 2 : visibleItem, fixedWidth: false, controls: showControls  },
                    1366: { items: 3 < visibleItem ? 3 : visibleItem, controls: showControls, fixedWidth: false },
                  }
                } else if ( jnews.library.hasClass(ele, "jeg_col_6") || jnews.library.hasClass(ele, "jeg_col_8") ) {
                  jcarouselDefault.container = jegWrapper
                  jcarouselDefault.responsive = {
                    0: { items: 1 },
                    280: { items: 2 < visibleItem ? 2 : visibleItem, controls: false },
                    360: { items: 3 < visibleItem ? 3 : visibleItem, controls: false },
                    540: { items: 4 < visibleItem ? 4 : visibleItem, controls: false },
                    768: { items: 2 < visibleItem ? 2 : visibleItem, fixedWidth: false, controls: showControls },
                    1024: { items: 3 < visibleItem ? 3 : visibleItem, controls: showControls, fixedWidth: false },
                    1366: { items: 4 < visibleItem ? 4 : visibleItem, controls: showControls, fixedWidth: false },
                  }
                } else if (  jnews.library.hasClass(ele, "jeg_col_12") ) {
                  jcarouselDefault.responsive = {
                    0: { items: 1 },
                    280: { items: 2 < visibleItem ? 2 : visibleItem, controls: false },
                    360: { items: 3 < visibleItem ? 3 : visibleItem, controls: false },
                    540: { items: 4 < visibleItem ? 4 : visibleItem, controls: false },
                    768: { items: 6 < visibleItem ? 6 : visibleItem, fixedWidth: false },
                    1024: { items: 7 < visibleItem ? 7 : visibleItem, controls: showControls, fixedWidth: false },
                    1366: { items: 8 < visibleItem ? 8 : visibleItem, controls: showControls, fixedWidth: false },
                  }
                }
            }

              jcarouselDefault.onInit = function () {
                wrapper = jnewsLibrary.getParents(jcarouselDefault.container, '.jeg_slider_wrapper')
                wrapper = wrapper.length ? wrapper[wrapper.length - 1] : jnewsLibrary.doc
                setNavCenter(jcarouselDefault.container, wrapper)
              }
              return jcarouselDefault;
            }

            return jcarouselDefault;
          })(options);
        options = jnews.library.extend(defaultOption, options || {});
        if (carouselType) {
          if (!jnews.library.hasClass(options.container, "jeg_tns_active")) {
            var carouselSlider = jnews.tns(options);
            if ("undefined" !== typeof carouselSlider) {
              carouselSlider.events.on("dragStart", function (info) {
                info.event.preventDefault();
                info.event.stopPropagation();
              });
              jnews.library.addClass(options.container, "jeg_tns_active");
              jnews.library.dataStorage.put(options.container, "tiny-slider", carouselSlider);
            }
            return carouselSlider;
          }
        }
      },
      setNavCenter = function (element, wrapper) {
        var slider_nav = wrapper.getElementsByClassName('tns-controls button')
        if (slider_nav.length) {
          var thumb = element.getElementsByClassName('thumbnail-container')
          if (thumb.length) {
            var thumb_height = thumb[0].getBoundingClientRect().height
            jnewsLibrary.forEach(slider_nav, function (ele, i) {
              var nav_height = ele.getBoundingClientRect().height,
                top = thumb_height * 0.5 - nav_height * 0.5
                ele.style.top = top + 'px'
            })
          }
        }
      }
    if (isTnsActive && isJNewsLibrary) {
      jnews.library.forEach(container, function(ele, i){
        var jnewsWebstories = ele.getElementsByClassName("jnews-webstories");
        jnews.library.forEach(jnewsWebstories, function(ele, i){
          webstoriesOnLoad(ele);
        })
      })
    } else {
      if (!isTnsActive) {
        console.warn("Tiny Slider could not be found");
      }
      if (!isJNewsLibrary) {
        console.warn("JNews Library could not be found");
      }
    }
  };

  $(document).on('ready', function () {
    Webstories($('body'))
  })

  $(document).on('jnews_vc_trigger jnews_elementor_trigger', function (event, element) {
		Webstories($(element))
	})

})(jQuery);