// ==UserScript==
// @name           L5R card highlight
// @namespace      https://byidi.fr/l5rch/
// @description    Highlight L5R card name and add visual
// @include        http://www.cardgamedb.com/*
// @include        https://www.reddit.com/r/l5r/comments/*
// @include        https://www.facebook.com/*
// @include        https://rokugang.wordpress.com/*
// @include        https://twitter.com/*
// @include        https://community.fantasyflightgames.com/topic/*
// @include        https://tsukesthoughts.wordpress.com/*
// @version		   1.7
// @downloadURL    https://byidi.fr/l5rch/l5r_card_highlight.user.js
// @updateURL      https://byidi.fr/l5rch/l5r_card_highlight.user.js
// @require        https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js
// ==/UserScript==

$321 = jQuery.noConflict();
		
$321.expr[':'].icontains = function(a, i, m) {
	var pattern = m[3].replace(/[’'"]/g, "\\\'").toUpperCase();
	var zonetext = jQuery(a).text().replace(/[’'"]/g, "\\\'").toUpperCase();
	return zonetext.indexOf(pattern) >= 0;
};

function getSearchZone(){
	var searchzone = null;
	switch(window.location.hostname) {
		case "www.cardgamedb.com":
			searchzone = [".post_body"];
			break;
		case "www.reddit.com":
			searchzone = [".usertext-body"];
			break;
		case "www.facebook.com":
			searchzone = [".UFICommentBody", ".userContent"];
			break;
		case "rokugang.wordpress.com":
			searchzone = [".entry-content"];
			break;
		case "twitter.com":
			searchzone = [".js-tweet-text-container"];
			break;
		case "community.fantasyflightgames.com":
			searchzone = [".ipsComment_content"];
			break;
		case "tsukesthoughts.wordpress.com":
			searchzone = [".post-content"];
			break;
		default:
			searchzone = ["body"];
	} 
	return searchzone;
}

function searchCardsName(cards){
	var searchzone = getSearchZone();
	$321.each(cards, function(cardid, card){
		$321.each(searchzone,function(id, zone){
			var selector = zone+":icontains("+ card.name_canonical +")";
			$321(selector).each(function(){
				replaceCardName($321(this), cardid, card);
			});
		});
	}); 
}

function replaceCardName(zone, cardid, card){
	var html = zone.html();
	var punc = "";
	var cardname = card.name_canonical;
	if (/[.!\?]/.test(card.name_canonical.slice(-1))){
		punc = card.name_canonical.slice(-1);
		cardname = card.name_canonical.substring(0, card.name_canonical.length-1);
	}
	zone.contents().each(function(nodeid, node){
		checkNode(nodeid, node, cardid, card);
	});
}

function checkNode(nodeid, node, cardid, card){
	if(node.nodeType == 3){
		var punc = "";
		var cardname = card.name_canonical.replace(/[’'"]/g, "\'");
		var nodenodeValue = node.nodeValue.replace(/[’'"]/g, "\'");
		if (/[.!\?]/.test(card.name_canonical.slice(-1))){
			punc = card.name_canonical.slice(-1);
			cardname = card.name_canonical.substring(0, card.name_canonical.length-1);
		}
		
		var regEx = new RegExp("(\\b"+cardname+"\\b"+punc+")", "ig");
		if(regEx.test(node.nodeValue.replace(/[’'"]/g, "\'"))){
			var replacementNode = document.createElement('span');
			replacementNode.innerHTML = node.nodeValue.replace(/[’'"]/g, "\'").replace(regEx,'<a href="https://fiveringsdb.com/card/'+card.id+'" class="L5RCH_link L5RCH_clan_'+card.clan+'" rel="'+cardid+'" target="_blank" >$1</a>');		
			node.replaceWith(replacementNode);
		}
		
	}else if(node.nodeType == 1){
		if(node.nodeName != "A"){
			$321.each(node.childNodes,function(childid,child){
				checkNode(childid, child, cardid, card);
			});
		}
	}
}

function replaceSpecialChar(){
	var searchzone = getSearchZone();
	$321.each(searchzone,function(id, zone){
		$321(zone).each(function(){
			var html = $321(this).html();
			var regEx = new RegExp("ō", "ig");
			var regEx = new RegExp("ô", "ig");
			$321(this).html(html.replace(regEx,'o'));
		});
	});
}

function setCss(){
	$321(".L5RCH_link").css("text-decoration","underline").css("cursor","pointer").css("font-weight","bold");
	
	$321(".L5RCH_clan_crane").css("color","#0089de");
	$321(".L5RCH_clan_crab").css("color","#001c94");
	$321(".L5RCH_clan_dragon").css("color","#00a472");
	$321(".L5RCH_clan_lion").css("color","#cb9d00");
	$321(".L5RCH_clan_phoenix").css("color","#c16400");
	$321(".L5RCH_clan_scorpion").css("color","#a61600");
	$321(".L5RCH_clan_unicorn").css("color","#780098");
	$321(".L5RCH_clan_neutral").css("color","#35373a");
}

function popup(cards){
	$321(".L5RCH_link").mouseenter(function(event){
		var card_id = $321(this).attr("rel");
		var card_url = null;
		if (cards[card_id].pack_cards.length > 0 && cards[card_id].pack_cards[0].hasOwnProperty('image_url')){
			card_url = cards[card_id].pack_cards[0].image_url;
		}else{
			if (cards[card_id].hasOwnProperty('side')){
				card_url = "https://byidi.fr/l5rch/images/"+cards[card_id].side+".png";
			}else{
				card_url = "https://byidi.fr/l5rch/images/dynasty.png";
			}
		}
		var popup = '<img  id="L5RCH_popup" src="'+card_url+'" style="height:400px;">';
		$321("body").append(popup);
		
		$321("#L5RCH_popup").css("border","1px solid black").css("background-color","black").css("border-radius","15px").css("padding","5px").css("position","absolute").css("zIndex","999");
		$321(document).mousemove(function(event){
			var left = event.pageX + 20;
			var top = event.pageY - 200;
			$321("#L5RCH_popup").css({top: top,left: left});
		});
	}).mouseleave(function(){
		$321("#L5RCH_popup").remove();
	});
}

$321(document).ready(function(){
    $321.getJSON('https://api.fiveringsdb.com/cards').done(function(json){
		var cardslist = json.records.reverse();
		var start = new Date();
		replaceSpecialChar();
		searchCardsName(cardslist);
		setCss();
		popup(cardslist);
		var time = new Date() - start;
		console.log("L5RCH : "+time+"ms");
	});
});

