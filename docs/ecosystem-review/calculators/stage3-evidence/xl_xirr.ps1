$ErrorActionPreference = "Stop"
$cases = @(
  @{name="example4"; flows=@(@("2023-01-01",-100000),@("2023-07-01",-50000),@("2024-03-31",20000),@("2025-01-01",170000))},
  @{name="two1827"; flows=@(@("2020-01-01",-100000),@("2025-01-01",200000))},
  @{name="loss"; flows=@(@("2022-01-01",-1000),@("2023-01-01",500))},
  @{name="leap"; flows=@(@("2023-12-31",-1000),@("2024-12-31",1100))},
  @{name="inFirst"; flows=@(@("2022-01-01",200),@("2023-01-01",-100))},
  @{name="monthly"; flows=@(@("2020-01-05",-1000),@("2020-02-05",-1000),@("2020-03-05",-1000),@("2020-04-05",-1000),@("2020-05-05",-1000),@("2020-06-05",-1000),@("2020-07-05",6600))},
  @{name="long40y"; flows=@(@("1990-01-01",-1000),@("2030-01-01",50000))},
  @{name="zeroish"; flows=@(@("2023-01-01",-1000),@("2024-01-01",1000.5))},
  @{name="samedayflows"; flows=@(@("2023-01-01",-500),@("2023-01-01",-500),@("2024-01-01",1200))},
  @{name="bigloss"; flows=@(@("2023-01-01",-100000),@("2024-01-01",1))}
)
$xl = New-Object -ComObject Excel.Application
$xl.Visible = $false
$xl.DisplayAlerts = $false
$wb = $xl.Workbooks.Add()
$ws = $wb.Worksheets.Item(1)
foreach ($c in $cases) {
  $ws.Cells.Clear() | Out-Null
  $i = 1
  foreach ($f in $c.flows) {
    $d = [datetime]::ParseExact($f[0], "yyyy-MM-dd", $null)
    $ws.Cells.Item($i,1).Value2 = $d.ToOADate()
    $ws.Cells.Item($i,2).Value2 = [double]$f[1]
    $i++
  }
  $n = $i - 1
  $ws.Cells.Item(1,4).Formula = "=XIRR(B1:B$n,A1:A$n)"
  $v = $ws.Cells.Item(1,4).Value2
  "{0}`t{1}" -f $c.name, $v
}
$wb.Close($false)
$xl.Quit()
[System.Runtime.InteropServices.Marshal]::ReleaseComObject($xl) | Out-Null
