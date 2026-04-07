$ErrorActionPreference = "Stop"

if (-not $env:TALLY_API_KEY) { 
    Write-Host "Set your API key: `$env:TALLY_API_KEY='your_key'" -ForegroundColor Red
    return 
}

function New-GuidStr { [guid]::NewGuid().ToString() }

$dropGroupUuid = New-GuidStr

$jsonContent = @{
    status = "DRAFT"
    blocks = @(
        @{
            uuid      = New-GuidStr
            type      = "FORM_TITLE"
            groupUuid = New-GuidStr
            groupType = "TEXT"
            payload   = @{ 
                title = "AESDR Support"
                safeHTMLSchema = @(,@("AESDR Support"))
                button = @{ label = "Submit" }
            }
        }

        # Name
        @{ uuid = New-GuidStr; type = "TITLE";      groupUuid = New-GuidStr; groupType = "QUESTION";   payload = @{ safeHTMLSchema = @(,@("Name")) } }
        @{ uuid = New-GuidStr; type = "INPUT_TEXT"; groupUuid = New-GuidStr; groupType = "INPUT_TEXT"; payload = @{ isRequired = $true; placeholder = "" } }

        # Email
        @{ uuid = New-GuidStr; type = "TITLE";       groupUuid = New-GuidStr; groupType = "QUESTION";    payload = @{ safeHTMLSchema = @(,@("Email")) } }
        @{ uuid = New-GuidStr; type = "INPUT_EMAIL"; groupUuid = New-GuidStr; groupType = "INPUT_EMAIL"; payload = @{ isRequired = $true; placeholder = "" } }

        # Issue Type dropdown
        @{ uuid = New-GuidStr; type = "TITLE"; groupUuid = New-GuidStr; groupType = "QUESTION"; payload = @{ safeHTMLSchema = @(,@("Issue Type")); isFolded = $false } }
        @{ uuid = New-GuidStr; type = "DROPDOWN_OPTION"; groupUuid = $dropGroupUuid; groupType = "DROPDOWN"; payload = @{ index = 0; isRequired = $true; isFirst = $true;  isLast = $false; text = "Access issue" } }
        @{ uuid = New-GuidStr; type = "DROPDOWN_OPTION"; groupUuid = $dropGroupUuid; groupType = "DROPDOWN"; payload = @{ index = 1; isRequired = $true; isFirst = $false; isLast = $false; text = "Bug report" } }
        @{ uuid = New-GuidStr; type = "DROPDOWN_OPTION"; groupUuid = $dropGroupUuid; groupType = "DROPDOWN"; payload = @{ index = 2; isRequired = $true; isFirst = $false; isLast = $false; text = "Billing" } }
        @{ uuid = New-GuidStr; type = "DROPDOWN_OPTION"; groupUuid = $dropGroupUuid; groupType = "DROPDOWN"; payload = @{ index = 3; isRequired = $true; isFirst = $false; isLast = $true;  text = "Other" } }

        # Description
        @{ uuid = New-GuidStr; type = "TITLE";    groupUuid = New-GuidStr; groupType = "QUESTION";  payload = @{ safeHTMLSchema = @(,@("Description")) } }
        @{ uuid = New-GuidStr; type = "TEXTAREA"; groupUuid = New-GuidStr; groupType = "TEXTAREA";  payload = @{ isRequired = $true; placeholder = "" } }
    )
} | ConvertTo-Json -Depth 100

$jsonFile = "$PSScriptRoot\temp_form.json"
$jsonContent | Out-File -FilePath $jsonFile -Encoding utf8

Write-Host "Creating AESDR Support Form..." -ForegroundColor Cyan

curl.exe -X POST "https://api.tally.so/forms" `
     -H "Authorization: Bearer $($env:TALLY_API_KEY)" `
     -H "Content-Type: application/json" `
     -d "@$jsonFile"

if (Test-Path $jsonFile) { Remove-Item $jsonFile }