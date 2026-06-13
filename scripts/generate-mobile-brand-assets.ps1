param(
  [string]$SourceImage = (Join-Path $PSScriptRoot '..\public\images\96e4912f-19c6-4e22-aa20-512a75f63282.jpg'),
  [string]$OutputDir = (Join-Path $PSScriptRoot '..\mobile\assets'),
  [string]$WebOutputDir = (Join-Path $PSScriptRoot '..\public\icons'),
  [string]$AndroidResDir = (Join-Path $PSScriptRoot '..\mobile\android\app\src\main\res')
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

Add-Type -AssemblyName System.Drawing

$workspaceRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))

function Assert-InWorkspace {
  param([string]$Path)

  $fullPath = [System.IO.Path]::GetFullPath($Path)
  if (-not $fullPath.StartsWith($workspaceRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Refusing to write outside workspace: $fullPath"
  }
}

function Set-HighQuality {
  param([System.Drawing.Graphics]$Graphics)

  $Graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $Graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $Graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  $Graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
}

function New-Canvas {
  param([int]$Size)

  return New-Object System.Drawing.Bitmap($Size, $Size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
}

function Draw-CoverImage {
  param(
    [System.Drawing.Graphics]$Graphics,
    [System.Drawing.Image]$Image,
    [int]$Size
  )

  $ratio = [Math]::Max($Size / $Image.Width, $Size / $Image.Height)
  $width = $Image.Width * $ratio
  $height = $Image.Height * $ratio
  $x = ($Size - $width) / 2
  $y = ($Size - $height) / 2
  $dest = [System.Drawing.RectangleF]::new($x, $y, $width, $height)
  $Graphics.DrawImage($Image, $dest)
}

function Save-Icon {
  param(
    [System.Drawing.Image]$Image,
    [string]$Path,
    [int]$Size
  )

  $directory = Split-Path -Parent $Path
  Assert-InWorkspace $Path
  if (-not (Test-Path $directory)) {
    New-Item -ItemType Directory -Path $directory -Force | Out-Null
  }

  $bitmap = New-Canvas $Size
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  try {
    Set-HighQuality $graphics
    Draw-CoverImage $graphics $Image $Size
  } finally {
    $graphics.Dispose()
  }

  $bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
  $bitmap.Dispose()
}

function Remove-OldIcon {
  param([string]$Path)

  if (Test-Path $Path) {
    Assert-InWorkspace $Path
    Remove-Item -LiteralPath $Path -Force
  }
}

if (-not (Test-Path $SourceImage)) {
  throw "Source image not found: $SourceImage"
}

$source = [System.Drawing.Image]::FromFile($SourceImage)
try {
  Save-Icon -Image $source -Path (Join-Path $OutputDir 'icon.png') -Size 1024
  Save-Icon -Image $source -Path (Join-Path $OutputDir 'store-icon-1024.png') -Size 1024
  Save-Icon -Image $source -Path (Join-Path $OutputDir 'splash-icon.png') -Size 1024
  Save-Icon -Image $source -Path (Join-Path $OutputDir 'adaptive-icon-foreground.png') -Size 432
  Save-Icon -Image $source -Path (Join-Path $OutputDir 'adaptive-icon-background.png') -Size 432
  Save-Icon -Image $source -Path (Join-Path $OutputDir 'favicon.png') -Size 64

  Save-Icon -Image $source -Path (Join-Path $WebOutputDir 'app-icon-192.png') -Size 192
  Save-Icon -Image $source -Path (Join-Path $WebOutputDir 'app-icon-512.png') -Size 512
  Save-Icon -Image $source -Path (Join-Path $WebOutputDir 'apple-touch-icon.png') -Size 180

  if (Test-Path $AndroidResDir) {
    $legacySizes = @{
      mdpi = 48
      hdpi = 72
      xhdpi = 96
      xxhdpi = 144
      xxxhdpi = 192
    }
    $adaptiveSizes = @{
      mdpi = 108
      hdpi = 162
      xhdpi = 216
      xxhdpi = 324
      xxxhdpi = 432
    }
    $splashSizes = @{
      mdpi = 100
      hdpi = 150
      xhdpi = 200
      xxhdpi = 300
      xxxhdpi = 400
    }

    foreach ($density in $legacySizes.Keys) {
      $mipmapDir = Join-Path $AndroidResDir "mipmap-$density"

      foreach ($name in @('ic_launcher', 'ic_launcher_round')) {
        Remove-OldIcon -Path (Join-Path $mipmapDir "$name.webp")
        Save-Icon -Image $source -Path (Join-Path $mipmapDir "$name.png") -Size $legacySizes[$density]
      }

      foreach ($name in @('ic_launcher_foreground', 'ic_launcher_background', 'ic_launcher_monochrome')) {
        Remove-OldIcon -Path (Join-Path $mipmapDir "$name.webp")
        Save-Icon -Image $source -Path (Join-Path $mipmapDir "$name.png") -Size $adaptiveSizes[$density]
      }

      Save-Icon -Image $source -Path (Join-Path $AndroidResDir "drawable-$density\splashscreen_logo.png") -Size $splashSizes[$density]
    }
  }
} finally {
  $source.Dispose()
}

Write-Output "Generated mobile, Android, and PWA icons from $SourceImage"
