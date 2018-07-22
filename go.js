console.log("Loading success...");
function buildMap(html){
	var xspj_body = $(html).filter("div.xspj-body");
	var requestMap = {
		"ztpjbl" :$(xspj_body).data("ztpjbl"),
		"jszdpjbl":$(xspj_body).data("jszdpjbl"),
		"xykzpjbl":$(xspj_body).data("xykzpjbl"),
		//教学班ID
		"jxb_id" : $(xspj_body).data("jxb_id"),
		//课程号ID
		"kch_id" : $(xspj_body).data("kch_id"),
		//教工号ID
		"jgh_id" : $(xspj_body).data("jgh_id"),
		//学时代码
		"xsdm"   : $(xspj_body).data("xsdm")
	};
	//循环评价对象
	i = 0;
	var p = $(html).find("div.panel-pjdx");
		//评价模版名称ID
	var pjmbmcb_id = p.attr("data-pjmbmcb_id");
	var pjdxdm = p.attr("data-pjdxdm");
	if(true){
		//评语
		var py = $("#"+pjmbmcb_id+"_py").val();
		requestMap["modelList["+i+"].pjmbmcb_id"] = pjmbmcb_id;
		requestMap["modelList["+i+"].pjdxdm"] = pjdxdm;
		requestMap["modelList["+i+"].py"] = $.founded(py) ? encodeURIComponent(py) : "";
		requestMap["modelList["+i+"].xspfb_id"] = p.attr("data-xspfb_id");
		var j_index = 0;
		//循环学生评价一级指标
		var f = true;
		p.find("table.table-xspj").each(function(j,table){
			var valid_t = false;
			//循环学生评价二级指标
			var k_index = 0;
			
			var num = $(table).find("tr.tr-xspj").size()-1;
			var luck = Math.round(Math.random()*num);
			$(table).find("tr.tr-xspj").each(function(k,tr){
				
				var valid = false;
				var pjzbxm_id = $(tr).attr("data-pjzbxm_id");
				var pfdjdmb_id = $(tr).attr("data-pfdjdmb_id");
				var zsmbmcb_id = $(tr).attr("data-zsmbmcb_id");
				var dtlx = $(tr).attr("data-dtlx");//根据答题类型1：主观题  2：客观题 判断取值
				if(dtlx == '2'){
					//多级别制
					if($(tr).find("div.form-group").size() > 0 ){
						//已选
						if (k==luck&&f) {
							var xspf = $(tr).find("input[data-dyf='80']");
							f=false;
						}else{
							var xspf = $(tr).find("input[data-dyf='95']");
						}
						if(xspf.size() > 0 ){
							valid = true;
							//二级评分等级代码项目ID
							requestMap["modelList["+i+"].xspjList["+j_index+"].childXspjList["+k_index+"].pfdjdmxmb_id"] = xspf.attr("data-pfdjdmxmb_id");
						}
					}else{
						//已评分
						var xspf = $(tr).find("input.form-control").val();
						if($.founded(xspf)){
							valid = true;
							//评价分
							requestMap["modelList["+i+"].xspjList["+j_index+"].childXspjList["+k_index+"].pjf"] = xspf;
						}
					}
				}else if(dtlx == '1'){
					if($(tr).find("div.form-group").size() > 0 ){
						var zgpj = $(tr).find("textarea.form-control").val();
						if($.founded(zgpj)){
							valid = true;
							requestMap["modelList["+i+"].xspjList["+j_index+"].childXspjList["+k_index+"].zgpj"] = zgpj;
						}
					}
				}
				
				//只有有进行评价才会组织参数
				if(valid){
					valid_t = true;
					//二级评价指标项目ID
					requestMap["modelList["+i+"].xspjList["+j_index+"].childXspjList["+k_index+"].pjzbxm_id"] = pjzbxm_id;
					//评分等级代码ID
					requestMap["modelList["+i+"].xspjList["+j_index+"].childXspjList["+k_index+"].pfdjdmb_id"] = pfdjdmb_id;
					//真实模板名称表id
					requestMap["modelList["+i+"].xspjList["+j_index+"].childXspjList["+k_index+"].zsmbmcb_id"] = zsmbmcb_id;
					
					k_index ++;
				}
			});
			//只有有进行评价才会组织参数
			if(valid_t){
				//一级评价指标项目ID
				requestMap["modelList["+i+"].xspjList["+j_index+"].pjzbxm_id"] = $(table).data("pjzbxm_id");
				
				j_index ++;
			}
			});
		}else{
			return false;
		}
	return requestMap;
}
var suc =0;
var fai =0;
if($("tr[data-tjzt='0']").length){
	console.log($("tr[data-tjzt='0']").length+"works founded.Start working...");
}else{
	console.log("没有找到评价项目，请前往评价页面后重试！");
}
$("tr[data-tjzt='0']").map(function(index,currtTR){
	$.ajax({
		type: "POST",
		async: false,
		url: _path + "/xspjgl/xspj_cxXspjDisplay.html",
		data: {
		"jxb_id"	: $(currtTR).data("jxb_id"),
		"kch_id"	: $(currtTR).data("kch_id"),
		"xsdm"		: $(currtTR).data("xsdm"),
		"jgh_id"	: $(currtTR).data("jgh_id"),
		"tjzt"      : $(currtTR).data("tjzt"),
		"pjmbmcb_id": $(currtTR).data("pjmbmcb_id")},
		success:function(responseText){
			html = $.parseHTML(responseText);
			var dataMap = buildMap(html);
			dataMap['tjzt'] = 0;
			$.ajax({
				type: "POST",
				async: false,
				url: _path + "/xspjgl/xspj_bcXspj.html" ,
				data: dataMap,
				datatype: "json",
				success: function(responseText){

					if($.type(responseText) == "string"){
						if(responseText.indexOf("成功") > -1){
							console.log('success '+$(currtTR).text().trim().slice(2)+" "+responseText);
							suc++;
						}else if(responseText.indexOf("失败") > -1){
							console.log('success 失败');
							fai++;
						} else{
							$.alert(responseText,function() {
							});
						}
					}
					if (index==$("tr[data-tjzt='0']").size()-1) {
						console.log("total:"+$("tr[data-tjzt='0']").size()+" success:"+suc+" fail:"+fai);
						if(suc==$("tr[data-tjzt='0']").size()){
							console.log("Congratulation!!(｡◕ˇ∀ˇ◕）不要忘记刷新后提交哦！！");
							console.log("源码开源于https://github.com/pyinal/jxpj-rtf,（´◔౪◔）求颗Star");
						}
					}
				},
				error:function(){
					console.log('error2');
					if (index==$("tr[data-tjzt='0']").size()-1) {
						console.log("total:"+$("tr[data-tjzt='0']").size()+" success:"+suc+" fail:"+fai);
					}
				}
			});
		},
		error:function(){
			console.log('error1');
		}
	});
})
