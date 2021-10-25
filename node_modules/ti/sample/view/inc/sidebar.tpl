<div class="qt-gl qt-250">
	<h3>Navgation</h3>
	<ul class="list">
	<%sideList.forEach(function(item,i){%>
		<li class="item"><a href="#p-<%=i%>"><%=item.title%></a></li>
	<%})%>
	</ul>
</div>