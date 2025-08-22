class GridSnap {
    constructor() {
        this.currentImage = null;
        this.settings = {
            cols: 6,
            rows: 6,
            showGrid: false,
            labelPosition: 'topLeft',
            darkText: false  // false = white text, true = black text
        };

        this.initElements();
        this.bindEvents();
    }

    initElements() {
        this.fileInput = document.getElementById('fileInput');
        this.resultSection = document.getElementById('resultSection');
        this.resultCanvas = document.getElementById('resultCanvas');
        this.resultCtx = this.resultCanvas.getContext('2d');
        this.workingCanvas = document.getElementById('workingCanvas');
        this.workingCtx = this.workingCanvas.getContext('2d');

        this.addGridCheckbox = document.getElementById('addGrid');
        this.labelsTopLeft = document.getElementById('labelsTopLeft');
        this.labelsBottomRight = document.getElementById('labelsBottomRight');
        this.labelsAll = document.getElementById('labelsAll');

        this.colsDisplay = document.getElementById('colsDisplay');
        this.rowsDisplay = document.getElementById('rowsDisplay');
        this.colsUp = document.getElementById('colsUp');
        this.colsDown = document.getElementById('colsDown');
        this.rowsUp = document.getElementById('rowsUp');
        this.rowsDown = document.getElementById('rowsDown');

        this.downloadBtn = document.getElementById('downloadBtn');

        this.darkTextCheckbox = document.getElementById('darkText');
        this.addWatermarkCheckbox = document.getElementById('addWatermark');
    }

    bindEvents() {
        this.fileInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                this.handleFile(e.target.files[0]);
            }
        });

        this.addGridCheckbox.addEventListener('change', () => this.processImage());

        this.labelsTopLeft.addEventListener('click', () => this.setLabelPosition('topLeft'));
        this.labelsBottomRight.addEventListener('click', () => this.setLabelPosition('bottomRight'));
        this.labelsAll.addEventListener('click', () => this.setLabelPosition('all'));

        this.colsUp.addEventListener('click', () => this.adjustCols(1));
        this.colsDown.addEventListener('click', () => this.adjustCols(-1));
        this.rowsUp.addEventListener('click', () => this.adjustRows(1));
        this.rowsDown.addEventListener('click', () => this.adjustRows(-1));

        this.downloadBtn.addEventListener('click', () => this.downloadImage());

        this.darkTextCheckbox.addEventListener('change', () => this.processImage());
        this.addWatermarkCheckbox.addEventListener('change', () => this.processImage());
    }


    handleFile(file) {
        if (!file || !file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.currentImage = img;
                this.processImage();
                this.resultSection.style.display = 'block';
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    setLabelPosition(position) {
        this.settings.labelPosition = position;

        document.querySelectorAll('.btn-icon').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`labels${position.charAt(0).toUpperCase() + position.slice(1)}`).classList.add('active');

        if (this.currentImage) this.processImage();
    }

    adjustCols(delta) {
        this.settings.cols = Math.max(2, Math.min(26, this.settings.cols + delta));
        this.colsDisplay.textContent = this.settings.cols;
        if (this.currentImage) this.processImage();
    }

    adjustRows(delta) {
        this.settings.rows = Math.max(2, Math.min(99, this.settings.rows + delta));
        this.rowsDisplay.textContent = this.settings.rows;
        if (this.currentImage) this.processImage();
    }

    processImage() {
        if (!this.currentImage) return;

        this.settings.showGrid = this.addGridCheckbox.checked;

        // Set up working canvas with image
        this.workingCanvas.width = this.currentImage.width;
        this.workingCanvas.height = this.currentImage.height;
        this.workingCtx.drawImage(this.currentImage, 0, 0);

        this.settings.darkText = this.darkTextCheckbox.checked;
        this.settings.addWatermark = this.addWatermarkCheckbox.checked;


        // Apply grid
        this.drawGridOnCanvas(
            this.workingCtx,
            0, 0,
            this.currentImage.width,
            this.currentImage.height
        );

        // Update display canvas
        const maxWidth = 400;
        const scale = Math.min(1, maxWidth / this.workingCanvas.width);

        this.resultCanvas.width = this.workingCanvas.width * scale;
        this.resultCanvas.height = this.workingCanvas.height * scale;

        this.resultCtx.drawImage(
            this.workingCanvas,
            0, 0, this.workingCanvas.width, this.workingCanvas.height,
            0, 0, this.resultCanvas.width, this.resultCanvas.height
        );

    }

    drawWatermark(ctx, width, height) {
        if (!this.settings.addWatermark) return;

        const fontSize = Math.max(12, Math.min(width, height) / 25);
        ctx.font = `${fontSize}px Arial`;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';

        const textColor = this.settings.darkText ? '0,0,0' : '255,255,255';
        const outlineColor = this.settings.darkText ? '255,255,255' : '0,0,0';

        ctx.strokeStyle = `rgba(${outlineColor}, 0.6)`;
        ctx.lineWidth = 1;
        ctx.strokeText('addgrid.org', width - 20, height - 50);

        ctx.fillStyle = `rgba(${textColor}, 0.7)`;
        ctx.fillText('addgrid.org', width - 20, height - 50);
    }

    drawGridOnCanvas(ctx, x, y, width, height) {
        if (!this.settings.showGrid && this.settings.labelPosition === 'none') return;

        const cellWidth = width / this.settings.cols;
        const cellHeight = height / this.settings.rows;
        const minDimension = Math.min(width, height);
        const lineWidth = Math.max(1, minDimension / 400);
        const fontSize = Math.max(10, minDimension / 25);

        // Grid lines
        if (this.settings.showGrid) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.lineWidth = lineWidth;

            for (let i = 0; i <= this.settings.cols; i++) {
                const lineX = x + i * cellWidth;
                ctx.beginPath();
                ctx.moveTo(lineX, y);
                ctx.lineTo(lineX, y + height);
                ctx.stroke();
            }

            for (let i = 0; i <= this.settings.rows; i++) {
                const lineY = y + i * cellHeight;
                ctx.beginPath();
                ctx.moveTo(x, lineY);
                ctx.lineTo(x + width, lineY);
                ctx.stroke();
            }
        }

        // Labels
        if (this.settings.labelPosition !== 'none') {
            ctx.font = `bold ${fontSize}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            const showTop = this.settings.labelPosition === 'topLeft' || this.settings.labelPosition === 'all';
            const showBottom = this.settings.labelPosition === 'bottomRight' || this.settings.labelPosition === 'all';
            const showLeft = this.settings.labelPosition === 'topLeft' || this.settings.labelPosition === 'all';
            const showRight = this.settings.labelPosition === 'bottomRight' || this.settings.labelPosition === 'all';

            // Column labels (A-Z)
            for (let i = 0; i < this.settings.cols && i < 26; i++) {
                const label = String.fromCharCode(65 + i);
                const labelX = x + (i + 0.5) * cellWidth;

                if (showTop) {
                    this.drawTextWithOutline(ctx, label, labelX, y + cellHeight * 0.15, fontSize);
                }
                if (showBottom) {
                    this.drawTextWithOutline(ctx, label, labelX, y + height - cellHeight * 0.15, fontSize);
                }
            }

            // Row labels
            for (let i = 0; i < this.settings.rows; i++) {
                const label = (i + 1).toString();
                const labelY = y + (i + 0.5) * cellHeight;

                if (showLeft) {
                    this.drawTextWithOutline(ctx, label, x + cellWidth * 0.15, labelY, fontSize);
                }
                if (showRight) {
                    this.drawTextWithOutline(ctx, label, x + width - cellWidth * 0.15, labelY, fontSize);
                }
            }
        }

      this.drawWatermark(ctx, width, height);
    }


    drawTextWithOutline(ctx, text, x, y, fontSize) {
        const outlineWidth = Math.max(2, fontSize / 8);

        const textColor = this.settings.darkText ? '0,0,0' : '255,255,255';
        const outlineColor = this.settings.darkText ? '255,255,255' : '0,0,0';

        ctx.strokeStyle = `rgba(${outlineColor}, 0.8)`;
        ctx.lineWidth = outlineWidth;
        ctx.strokeText(text, x, y);

        ctx.fillStyle = `rgba(${textColor}, 0.95)`;
        ctx.fillText(text, x, y);
    }

    downloadImage() {
        if (!this.workingCanvas) return;

        // Get original filename and create new name
        const originalName = this.fileInput.files[0]?.name || 'image';
        const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
        const filename = `${nameWithoutExt}_addgrid_org.png`;

        this.workingCanvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
        }, 'image/png');
    }

    downloadImage() {
        if (!this.workingCanvas) return;

        // Get original file type
        const originalFile = this.fileInput.files[0];
        const originalName = originalFile?.name || 'image';

        // If jpeg is around 4 MB and many pixels we don't want to create a 45 MB png...
        const isJpeg = originalFile?.type.includes('jpeg') || originalName.toLowerCase().includes('.jpg');

        const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
        const ext = isJpeg ? 'jpg' : 'png';
        const filename = `${nameWithoutExt}_addgrid_org.${ext}`;
        const mimeType = isJpeg ? 'image/jpeg' : 'image/png';
        const quality = isJpeg ? 0.92 : undefined; // High quality JPEG

        this.workingCanvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
        }, mimeType, quality);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new GridSnap();
});
