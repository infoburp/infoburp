
// this function based on http://bl.ocks.org/2653660
function insert_editor(d,i){
    
    var p = this.parentNode;
    console.log(this, arguments);
        
    // inject a HTML form to edit the content here...

    var el = d3.select(this);
    var p_el = d3.select(p);
    
    var frm = p_el.append("xhtml:form");
    
    frm.attr("class","editor-form");
    
    var inp = frm.append("input")
	.attr("class","editor-input");
    
    inp.attr("value", function() {
		 console.log("value this",this);
		 //this.focus();
		 d.showHtml = "none";
                 return d.nodehtml;
             });
    inp
	.style("height",FOREIGHN_OBJECT_SIDE)
        .style("width",FOREIGHN_OBJECT_SIDE);
    
    // make the form go away when you jump out (form looses focus) or hit ENTER:
    inp.on("blur", function() {
               console.log("blur", this,inp,p_el, arguments);
	       
               var txt = inp.node().value;
               
               d.nodehtml = txt;
	       d.showHtml = "block";
               
               p_el.select("form.editor-form").remove();
           });
    inp.on("keypress", function() {
	       
               var e = d3.event;
               if (e.keyCode == 13)
	       {
		   
                   if (e.stopPropagation)
		       e.stopPropagation();
                   e.preventDefault();
		   
                   var txt = inp.node().value;
                                    

		   console.log(inp,p_el,p_el.select("form-editor.form"));
                   
		   d.nodehtml = txt;
		   d.showHtml = "block";
                   
		   el
		       .text(function(d) { return d.nodehtml; });
                   
                   p_el.select("form.editor-form").remove();
	       }
           });
    
    console.log('outer select',d3.select("input.editor-input")[0][0]);
    
    setTimeout(d3.select("input.editor-input")[0][0].focus(),10);
    //frm.call(focus);

    
};
