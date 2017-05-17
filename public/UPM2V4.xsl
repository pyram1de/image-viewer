<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:fn="http://www.w3.org/2005/xpath-functions" xmlns:xdt="http://www.w3.org/2005/xpath-datatypes" xmlns:xs="http://www.w3.org/2001/XMLSchema">
	<xsl:output method="html"/>
	<xsl:template name = "Calculation" match = "Calculation">
	<br></br>
	<table border = "1">
	<tr>
	<td>
		<table border="0" width="100%" cellspacing="0" id="AutoNumber1" height="54" style="border-collapse: collapse" bordercolor="#111111" cellpadding="3">
			<tr>
				<td width="70" background="Resource/upm_title1.bmp" height="43%" nowrap="">&#160;
					<td  width="100%" background="Resource/blackbar1.bmp" height="43%" valign="top">&#160;
						<xsl:if test = "@SubCalcName">
							<a name = "{@SubCalcName}"/>
						</xsl:if>
						<xsl:for-each select = "Object">
							<xsl:choose>
								<xsl:when test="CalculationTitle">
								<a onclick ="history.back()">
									<font Color="#ffffff" size="4">
										<b>
											<xsl:value-of select="CalculationTitle"/>DAVE
										</b>
									</font>
								</a>
								</xsl:when>
							</xsl:choose>
						</xsl:for-each>
					</td>
				</td>
			</tr>
		</table>
		<xsl:if test = "Grid">
		<table border="0"  cellpadding="1" width="100%">
			<xsl:apply-templates select = "Grid"/>
		</table>	
		</xsl:if>
		<xsl:if test = "SubCalcs">
			<xsl:apply-templates select = "SubCalcs">
				<xsl:with-param name = "Calc" select = "@Calculation"/>
			</xsl:apply-templates>
		</xsl:if>
		<xsl:if test = "Calculation">
			<xsl:apply-templates select = "Calculation"/>
		</xsl:if>
		
	</td>
	</tr>
	</table>
	
	</xsl:template>

	
	<xsl:template name = "Grid" match = "Grid">
	<xsl:variable name = "IsList">
		<xsl:choose>
			<xsl:when test = "row/col/Control/@header='1'">
				<xsl:value-of select="1"/>
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="0"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:variable>
	
	
			<xsl:for-each select ="row">
				<row1>
				
				<tr>
				<xsl:if test = "$IsList='1'">
					<xsl:if test ="(position() mod 2 ) = 0">
						<xsl:attribute name="bgcolor">#DFE8DF</xsl:attribute>
					</xsl:if>
				</xsl:if>
				<xsl:for-each select ="col">
				</xsl:for-each>
						<xsl:for-each select ="col">
							<Column>
								<td>
									<xsl:choose>
										<xsl:when test = "Control">
											<xsl:if test = "Control/@text!='Close' and Control/@text!='Image' and Control/@name!='txHeader'" >
												<xsl:choose>
													<xsl:when test = "Control/@SubCalc">
														<a href="{concat('#',Control/@SubCalc)}">
															<xsl:value-of select="Control/@text"/>
														</a>
													</xsl:when>
													<xsl:when test = "Control/@header='1'">
														<xsl:attribute name="bgcolor">#000000</xsl:attribute>	
														<font color = "white" size = "3">
														<div nowrap = "">
														<b>
															<xsl:value-of select="Control/@text"/>														
														</b>
														</div>
														</font>
													</xsl:when>
													
													<xsl:when test="Control and Control/@name!='idHeader'">
														<font size = "2">
															<xsl:value-of select="Control/@text"/>
														</font>
													</xsl:when>
												</xsl:choose>
											</xsl:if>
										</xsl:when>
									</xsl:choose>
									<xsl:if test = "row">
										<xsl:attribute name="bgcolor">#FFFFFF</xsl:attribute>	
										<xsl:call-template name = "Grid"/>
									</xsl:if>
								</td>
							</Column>
						</xsl:for-each>
					</tr>
				</row1>
			</xsl:for-each>
	</xsl:template>
	
	
	<xsl:template name = "Object" match = "Object">
		<br></br>
	</xsl:template>
	<xsl:template name = "SubCalcs" match = "SubCalcs">
		<blockquote>
			<xsl:apply-templates select="Calculation"/>
		</blockquote>
	</xsl:template>
	
	<xsl:template name = "ColourRow">
		<xsl:if test ="(position() mod 2 ) = 0">
			<xsl:attribute name="bgcolor">#DFE8DF</xsl:attribute>
		</xsl:if>
	</xsl:template>
	

</xsl:stylesheet>