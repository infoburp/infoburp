function GenerateNodeID()
{
    myID = AJAXRequest("GET","/dbcon.php?cmd=getdateid");
	myID = myID.replace("\.","");
	myID = myID.replace(" ","");
	return myID;
}
function SpringyNode(inGraph,inParentNode,inAttributes)
{
	var me = this;
	var clsGraph = inGraph;
	var clsParentNode = inParentNode;
	var clsNode = clsGraph.newNode(inAttributes);
	clsNode.ctrlNode = me;
	
	var clsChildNodes = [];
	
	this.GetNode = function()
	{
		return clsNode;
	}
	this.SetParent = function(inNode)
	{
		clsParentNode = inNode;
	}
	this.AddChild = function(inNode)
	{
		clsChildNodes[clsChildNodes.length] = inNode;
		inNode.SetParent(me);
		clsGraph.newEdge(clsNode,inNode.GetNode());
		return inNode;
	}
	this.Remove = function()
	{
		
		clsGraph.removeNode(clsNode);
		document.body.removeChild(clsNode.mainDiv);
	}
	clsNode.cancelBtn.onclick=this.Remove;
	this.FindNode = function(inNode)
	{
		var retVal=false;
		if(inNode==clsNode)
			return me;
		for(var i=0; i<clsChildNodes.length; i++)
		{
			retVal = clsChildNodes[i].FindNode(inNode);
			if(retVal)
				i=clsChildNodes.length +1;
		}
		return retVal;
	}
	this.SaveToDataBase = function()
	{
		var myLabel = clsNode.data.label.replace(/'/g,"''");
		myLabel = myLabel.replace(/\"/g,"\\\\\"");
		if(!clsNode.data.NodeID)
		{
			clsNode.data.NodeID = GenerateNodeID();
			AJAXRequest("GET","/dbcon.php?cmd=createnode&nodeid=" + clsNode.data.NodeID + "&html=" + myLabel);
		}
		else
		{
			AJAXRequest("GET","/dbcon.php?cmd=updatenode&nodeid=" + clsNode.data.NodeID + "&html=" + myLabel);
		}
		AJAXRequest("GET","/dbcon.php?cmd=createlink&parentid=" + clsParentNode.GetNode().data.NodeID + "&childid=" + clsNode.data.NodeID);
	}
}
function AJAXRequest(inType, inURL)
{
    var xmlhttp;
    if (window.XMLHttpRequest)
    {// 
        xmlhttp = new XMLHttpRequest();
    }
    else
    {// code for IE6, IE5
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.open(inType, inURL, false);
    xmlhttp.setRequestHeader("Cache-Control", "no-store,no-cache,must-revalidate");
    xmlhttp.setRequestHeader("Expires","Sun, 19 Nov 1978 05:00:00 GMT");
    xmlhttp.setRequestHeader("Cache-Control", "post-check=0, pre-check=0");
    xmlhttp.setRequestHeader("Pragma", "no-cache");
    xmlhttp.setRequestHeader("Last-Modified","1/1/2099");
    xmlhttp.send();
    return xmlhttp.responseText;
}
var dbNodes = [];
var dbLinks = [];
var genNodes = [];
function GetNodesFromDb()
{
	var myDBNodeData = AJAXRequest("GET","/dbcon.php?cmd=getnodes").split('\n\r');
	var myDBLinkData = AJAXRequest("GET","/dbcon.php?cmd=getlinks").split('\n\r');
	for(var i=0; i<myDBNodeData.length; i++)
	{
		try
		{
			dbNodes[i] = eval('(' + myDBNodeData[i] + ')');
		}
		catch(e)
		{}
	}
	for(var i=0; i<myDBLinkData.length; i++)
	{
		try
		{
			dbLinks[i] = eval('(' + myDBLinkData[i] + ')');
		}
		catch(e)
		{}
	}
	for(var i=0; i<dbNodes.length; i++)
	{
		if(dbNodes[i])
			genNodes[i] = new SpringyNode(graph,false,dbNodes[i]);
	}
	mainNode=genNodes[0];
	if(!mainNode)
		mainNode = new SpringyNode(graph,false,{editMode:true,label:"There are no nodes in the database.<br/>This will be the first one."})
	LinkDBNodes();
}
function LinkDBNodes()
{
	var myLinks;
	var myNode;
	for(var i=0; i<genNodes.length; i++)
	{
		if(genNodes[i])
		{
			myLinks = GetChildLinks(genNodes[i].GetNode().data.NodeID);
			for(var h=0; h<myLinks.length; h++)
			{
				myNode = FindDBNode(myLinks[h]);
				if(myNode)
					genNodes[i].AddChild(myNode);
			}
		}
	}
}
function FindDBNode(inID)
{
	var retVal;
	for(var i=0; i<genNodes.length; i++)
	{
		if(genNodes[i])
		{
			if(genNodes[i].GetNode().data.NodeID == inID)
				retVal = genNodes[i];
		}
	}
	return retVal;
}
function GetChildLinks(inID)
{
	var retVal = [];
	for(var i=0; i<dbLinks.length; i++)
	{
		if(dbLinks[i])
		{
			if(dbLinks[i].ParentID==inID)
				retVal[retVal.length] = dbLinks[i].ChildID;
		}
	}
	return retVal;
}
var selected = null;
var nearest = null;
var dragged = null;