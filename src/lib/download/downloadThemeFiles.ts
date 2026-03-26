type DownloadableFile = {
  fileName: string;
  fileUrl: string;
};

export async function downloadThemeFiles(files: DownloadableFile[]) {
  for (const file of files) {
    const link = document.createElement("a");
    link.href = file.fileUrl;
    link.download = file.fileName;
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    await new Promise((resolve) => setTimeout(resolve, 120));
  }
}
