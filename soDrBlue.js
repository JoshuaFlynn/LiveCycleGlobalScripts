
function GetChildrenObjectsList(node,underscorehandling,excludename)
{
	var children = [];
	var iter = 0;
	var tempObject = null;
	var quitLoop = false;
	var dudValue;
	
	do
	{
		try
		{
			tempObject = node.nodes.item(iter);
		}
		catch(err)
		{
			//console.println("Warning: " + err.message + " on iteration: " + iter + ". This is usually normal behaviour if it reaches the end.");
			quitLoop = true;
		}
		
		if(!quitLoop)
		{
			if(((excludename == null) || ((excludename != null) && (excludename != tempObject.name))))
			{
				if(underscorehandling == "All")
				{
					children.push(tempObject);
				}
				else if(underscorehandling == "IgnoreUnderscore")
				{
					if(!(tempObject.name.indexOf("_") > -1))
					{
						children.push(tempObject);
					}
				}
				else if(underscorehandling == "IgnoreNonUnderscore")
				{
					if((tempObject.name.indexOf("_") > -1))
					{
						children.push(tempObject);
					}
				}
				else
				{
					console.println(underscorehandling+" is not recognised.");
				}
			}
		}
		
		iter++;
	}
	while(!quitLoop);
	
	return children;
}

function DrBlue(node,GlobalRadioButtonList)
{
	var TableRowList = [];
	TableRowList = GetChildrenObjectsList(node,"IgnoreUnderscore",null);
	var SubFormList = [];
	var RadioButtonList = [];
	
	var Temp = null;
	
	//Iterate through our newly acquired row list
	for(var i = 0;i < TableRowList.length;i++)
	{
		//Get the list of child objects under a row (should be the sub forms)
		SubFormList = GetChildrenObjectsList(TableRowList[i],"IgnoreUnderscore",null);
		
		//Now we have the subform names, we iterate through for their children (should be the radio button list). Zoiks!
		for(var j = 0; j < SubFormList.length;j++)
		{
			RadioButtonList = GetChildrenObjectsList(SubFormList[j],"IgnoreUnderscore",null);
			
			//Now we iterate through the radio button list to get those important values.
			//Fun fact! In Ye Olden English, i/y/j were interchangeable. Hence why you get Wycke/Wick, Yeshua/Joshua, etc.
			for(var y = 0; y < RadioButtonList.length;y++)
			{
				if(RadioButtonList[y].name == GlobalRadioButtonList)
				{
					Temp = (RadioButtonList[y].rawValue == null) ? Temp : RadioButtonList[y].rawValue
				}
			}
		}

	}
	
	return Temp;	
}
