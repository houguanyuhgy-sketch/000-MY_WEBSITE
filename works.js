// 3D椭圆形立体环绕作品展示
class WorksRing {
    constructor() {
        this.canvas = document.getElementById('works-canvas');
        if (!this.canvas) {
            console.error('Canvas element not found!');
            return;
        }
        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            console.error('Could not get 2d context!');
            return;
        }
        
        // 使用数据驱动的作品数据（从works-data.js加载）
        this.works = worksData.map(work => ({
            ...work,
            image: null,
            aspectRatio: 1, // 默认正方形，加载后更新
            imageWidth: 0,
            imageHeight: 0
        }));
        
        // 加载所有图片
        this.loadImages();
        
        // 根据屏幕大小调整参数
        const isMobile = window.innerWidth < 768;
        // 增大圆环半径以增加作品间距，避免重叠
        this.radiusX = (isMobile ? 420 : 580) * 0.6 * 1.4; // 椭圆X轴半径（水平），增大40%以增加间距
        this.radiusY = (isMobile ? 230 : 320) * 0.6 * 1.4; // 椭圆Y轴半径（垂直），增大40%以增加间距
        // 初始旋转角度，让最清楚的作品在圆环靠右边的位置（右侧可以完整显示）
        // 由于椭圆旋转45度向上，当ellipseY=0且ellipseX>0时，作品在右侧且最清晰
        // 旋转角度使得最清晰的作品在右侧（x>0）
        this.rotationY = 0; // 初始角度0，让最清晰的作品在右侧
        this.targetRotationY = 0;
        this.autoRotateSpeed = 0.003; // 慢速自动旋转
        this.mouseX = 0;
        this.lastMouseX = 0;
        this.isDragging = false;
        this.hoveredWorkIndex = -1; // 当前悬停的作品索引
        this.touchStartX = 0; // 触摸开始时的X坐标
        this.touchStartY = 0; // 触摸开始时的Y坐标
        // 基础尺寸也相应缩小到3/5
        this.baseItemSize = (isMobile ? 200 : 280) * 0.6; // 缩小到3/5
        this.itemHeight = (isMobile ? 250 : 320) * 0.6; // 缩小到3/5
        
        // 创建噪点canvas用于模糊效果
        this.noiseCanvas = document.createElement('canvas');
        this.noiseCtx = this.noiseCanvas.getContext('2d');
        this.generateNoiseTexture();
        
        this.init();
    }
    
    loadImages() {
        // 加载所有图片
        let loadedCount = 0;
        const totalWorks = this.works.length;
        
        this.works.forEach((work, index) => {
            const img = new Image();
            // 移除crossOrigin限制，本地文件可能不支持CORS
            img.crossOrigin = null;
            
            img.onload = () => {
                loadedCount++;
                work.image = img;
                // 保存图片的实际尺寸和宽高比
                work.imageWidth = img.naturalWidth || img.width || 200;
                work.imageHeight = img.naturalHeight || img.height || 200;
                work.aspectRatio = work.imageWidth / work.imageHeight;
                console.log(`✓ Image ${index + 1} loaded: ${work.imagePath}, size: ${work.imageWidth}x${work.imageHeight}, ratio: ${work.aspectRatio.toFixed(2)}`);
            };
            
            // 尝试加载图片（对路径进行URL编码以处理中文字符）
            // 使用encodeURIComponent对文件名部分进行编码，但保留路径分隔符
            const pathParts = work.imagePath.split('/');
            const encodedFileName = encodeURIComponent(pathParts[pathParts.length - 1]);
            const encodedPath = pathParts.slice(0, -1).join('/') + '/' + encodedFileName;
            
            console.log(`Loading image ${index + 1}: ${work.imagePath}`);
            console.log(`  Encoded path: ${encodedPath}`);
            console.log(`  Full URL: ${window.location.href.replace(/\/[^/]*$/, '/')}${encodedPath}`);
            
            // 移除crossOrigin限制，因为本地文件可能不支持CORS
            img.crossOrigin = null;
            
            let triedOriginal = false;
            img.onerror = (error) => {
                if (!triedOriginal && img.src !== work.imagePath) {
                    // 如果编码路径失败，尝试原始路径
                    triedOriginal = true;
                    console.warn(`Failed to load encoded path, trying original: ${work.imagePath}`);
                    img.src = work.imagePath;
                } else {
                    // 如果原始路径也失败，创建占位符
                    loadedCount++;
                    console.error(`✗ Failed to load image ${index + 1}: ${work.imagePath}`, error);
                    console.error(`  Tried paths: ${encodedPath}, ${work.imagePath}`);
                    console.error(`  Full path: ${window.location.origin}${window.location.pathname.replace(/\/[^/]*$/, '/')}${work.imagePath}`);
                    // 创建一个占位符canvas（无边框，极简风格）
                    const placeholder = document.createElement('canvas');
                    placeholder.width = 200;
                    placeholder.height = 200;
                    const ctx = placeholder.getContext('2d');
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
                    ctx.fillRect(0, 0, 200, 200);
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                    ctx.font = '14px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(work.title, 100, 100);
                    work.image = placeholder;
                    work.imageWidth = 200;
                    work.imageHeight = 200;
                    work.aspectRatio = 1;
                    console.warn(`Image ${index + 1} failed to load: ${work.imagePath}`);
                }
            };
            
            // 设置图片源（先尝试编码路径）
            img.src = encodedPath;
            
            // 如果图片已经加载完成（移动端可能已缓存），立即触发onload
            if (img.complete && img.naturalWidth > 0) {
                img.onload();
            }
        });
    }
    
    generateNoiseTexture() {
        // 创建精致的噪点纹理
        this.noiseCanvas.width = 256;
        this.noiseCanvas.height = 256;
        const imageData = this.noiseCtx.createImageData(256, 256);
        const data = imageData.data;
        
        for (let y = 0; y < 256; y++) {
            for (let x = 0; x < 256; x++) {
                const index = (y * 256 + x) * 4;
                const value = Math.random() * 128 + 64;
                data[index] = value;
                data[index + 1] = value;
                data[index + 2] = value;
                data[index + 3] = 180;
            }
        }
        
        this.noiseCtx.putImageData(imageData, 0, 0);
    }
    
    init() {
        if (!this.canvas || !this.ctx) {
            console.error('Canvas or context not initialized');
            return;
        }
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        // 鼠标事件（桌面端）
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('mouseup', () => this.onMouseUp());
        this.canvas.addEventListener('mouseleave', () => this.onMouseLeave());
        this.canvas.addEventListener('click', (e) => this.onClick(e));
        
        // 触摸事件（移动端）
        this.canvas.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });
        this.canvas.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });
        this.canvas.addEventListener('touchend', (e) => this.onTouchEnd(e), { passive: false });
        this.canvas.addEventListener('touchcancel', () => this.onTouchEnd(), { passive: false });
        
        // 等待图片加载后再开始动画
        this.checkImagesAndAnimate();
    }
    
    checkImagesAndAnimate() {
        // 立即开始动画，即使图片还没加载完
        // 已加载的图片会显示，未加载的会显示占位符
        this.animate();
        
        // 继续检查图片加载状态
        const allLoaded = this.works.every(work => work.image !== null);
        if (!allLoaded) {
            // 如果图片还没加载完，等待一段时间再检查（用于更新显示）
            setTimeout(() => {
                // 图片加载完成后会自动更新显示
            }, 100);
        }
    }
    
    onMouseDown(e) {
        this.isDragging = true;
        const rect = this.canvas.getBoundingClientRect();
        this.lastMouseX = e.clientX - rect.left;
    }
    
    onMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        if (this.isDragging) {
            const deltaX = this.mouseX - this.lastMouseX;
            const sensitivity = 0.008;
            this.targetRotationY += deltaX * sensitivity;
            this.lastMouseX = this.mouseX;
        } else {
            // 检测鼠标是否悬停在作品上
            let hoveredIndex = -1;
            for (let i = 0; i < this.works.length; i++) {
                const pos = this.getWorkPosition(i);
                if (pos && this.works[i].image) {
                    const work = this.works[i];
                    const baseWidth = this.baseItemSize * pos.scale;
                    const baseHeight = this.baseItemSize * pos.scale;
                    
                    let displayWidth, displayHeight;
                    if (work.aspectRatio > 1) {
                        displayWidth = baseWidth;
                        displayHeight = baseWidth / work.aspectRatio;
                    } else {
                        displayHeight = baseHeight;
                        displayWidth = baseHeight * work.aspectRatio;
                    }
                    
                    const textAreaHeight = 60 * pos.scale;
                    const totalHeight = displayHeight + textAreaHeight;
                    const totalWidth = displayWidth;
                    
                    const distanceX = Math.abs(this.mouseX - pos.x);
                    const distanceY = Math.abs(mouseY - pos.y);
                    
                    if (distanceX < totalWidth / 2 && distanceY < totalHeight / 2) {
                        hoveredIndex = i;
                        break;
                    }
                }
            }
            
            // 记录悬停的作品索引
            this.hoveredWorkIndex = hoveredIndex;
            
            // 切换光标样式
            if (hoveredIndex >= 0) {
                this.canvas.classList.add('work-hover');
            } else {
                this.canvas.classList.remove('work-hover');
            }
        }
    }
    
    onMouseUp() {
        this.isDragging = false;
    }
    
    onMouseLeave() {
        this.isDragging = false;
        // 移除手型光标
        if (this.canvas) {
            this.canvas.classList.remove('work-hover');
        }
    }
    
    // 触摸事件处理（移动端）
    onTouchStart(e) {
        e.preventDefault(); // 阻止默认滚动行为
        if (e.touches.length > 0) {
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            this.touchStartX = touch.clientX - rect.left;
            this.touchStartY = touch.clientY - rect.top;
            this.isDragging = true;
            this.lastMouseX = this.touchStartX;
            this.mouseX = this.touchStartX;
        }
    }
    
    onTouchMove(e) {
        e.preventDefault(); // 阻止默认滚动行为
        if (e.touches.length > 0 && this.isDragging) {
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = touch.clientX - rect.left;
            const mouseY = touch.clientY - rect.top;
            
            // 处理旋转
            const deltaX = this.mouseX - this.lastMouseX;
            const sensitivity = 0.008;
            this.targetRotationY += deltaX * sensitivity;
            this.lastMouseX = this.mouseX;
            
            // 检测触摸是否悬停在作品上
            let hoveredIndex = -1;
            for (let i = 0; i < this.works.length; i++) {
                const pos = this.getWorkPosition(i);
                if (pos && this.works[i].image) {
                    const work = this.works[i];
                    const baseWidth = this.baseItemSize * pos.scale;
                    const baseHeight = this.baseItemSize * pos.scale;
                    
                    let displayWidth, displayHeight;
                    if (work.aspectRatio > 1) {
                        displayWidth = baseWidth;
                        displayHeight = baseWidth / work.aspectRatio;
                    } else {
                        displayHeight = baseHeight;
                        displayWidth = baseHeight * work.aspectRatio;
                    }
                    
                    const textAreaHeight = 60 * pos.scale;
                    const totalHeight = displayHeight + textAreaHeight;
                    const totalWidth = displayWidth;
                    
                    const distanceX = Math.abs(this.mouseX - pos.x);
                    const distanceY = Math.abs(mouseY - pos.y);
                    
                    if (distanceX < totalWidth / 2 && distanceY < totalHeight / 2) {
                        hoveredIndex = i;
                        break;
                    }
                }
            }
            
            // 更新悬停状态
            this.hoveredWorkIndex = hoveredIndex;
        }
    }
    
    onTouchEnd(e) {
        e.preventDefault();
        
        // 记录触摸开始和结束的位置，判断是否为点击
        if (e.changedTouches && e.changedTouches.length > 0) {
            const touch = e.changedTouches[0];
            const rect = this.canvas.getBoundingClientRect();
            const endX = touch.clientX - rect.left;
            const endY = touch.clientY - rect.top;
            
            // 如果移动距离很小（小于10px），认为是点击
            const moveDistanceX = Math.abs(endX - this.touchStartX);
            const moveDistanceY = Math.abs(endY - this.touchStartY);
            const totalMoveDistance = Math.sqrt(moveDistanceX * moveDistanceX + moveDistanceY * moveDistanceY);
            const isClick = totalMoveDistance < 10; // 移动距离小于10px认为是点击
            
            if (isClick) {
                // 检查是否点击了作品
                for (let i = 0; i < this.works.length; i++) {
                    const work = this.works[i];
                    const pos = this.getWorkPosition(i);
                    
                    if (pos && work.image) {
                        const baseWidth = this.baseItemSize * pos.scale;
                        const baseHeight = this.baseItemSize * pos.scale;
                        
                        let displayWidth, displayHeight;
                        if (work.aspectRatio > 1) {
                            displayWidth = baseWidth;
                            displayHeight = baseWidth / work.aspectRatio;
                        } else {
                            displayHeight = baseHeight;
                            displayWidth = baseHeight * work.aspectRatio;
                        }
                        
                        const textAreaHeight = 60 * pos.scale;
                        const totalHeight = displayHeight + textAreaHeight;
                        const totalWidth = displayWidth;
                        
                        const distanceX = Math.abs(endX - pos.x);
                        const distanceY = Math.abs(endY - pos.y);
                        
                        if (distanceX < totalWidth / 2 && distanceY < totalHeight / 2) {
                            window.location.href = `work-detail.html?id=${work.id}`;
                            break;
                        }
                    }
                }
            }
        }
        
        this.isDragging = false;
        this.hoveredWorkIndex = -1;
    }
    
    resize() {
        if (!this.canvas) return;
        
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight - 61; // 减去导航栏高度
        
        const isMobile = window.innerWidth < 768;
        // 圆环整体缩小为0.8倍大小
        this.radiusX = (isMobile ? 420 : 580) * 0.6 * 1.4 * 0.8;
        this.radiusY = (isMobile ? 230 : 320) * 0.6 * 1.4 * 0.8;
        
        // 检测是否为16:9屏幕比例（约1.78）
        const aspectRatio = this.canvas.width / this.canvas.height;
        const is16to9 = Math.abs(aspectRatio - 16/9) < 0.2; // 允许一定误差
        
        // 计算圆环的最大可能宽度（考虑旋转20度、半径倍数和45度旋转）
        // 旋转20度后，椭圆在XY平面的最大宽度需要考虑所有变换
        const maxRadiusMultiplier = 1.5; // 最清楚时半径增加50%
        const rotate20Rad = 20 * Math.PI / 180; // 20度旋转
        const rotate45Z = Math.PI / 4; // 45度
        
        // 计算椭圆在XY平面的最大X值（考虑15度旋转和半径倍数）
        // 当ellipseAngle = 0时，ellipseX最大，约为radiusX * maxRadiusMultiplier
        const maxEllipseX = this.radiusX * maxRadiusMultiplier;
        const maxEllipseY = this.radiusY * maxRadiusMultiplier;
        
        // 绕Z轴旋转45度后的最大X值
        const maxRotatedX = maxEllipseX * Math.cos(rotate45Z) - (-maxEllipseY) * Math.sin(rotate45Z);
        
        // 考虑20度旋转后的最大宽度（简化计算，使用最大可能值）
        const maxWidth = Math.abs(maxRotatedX) * Math.cos(rotate20Rad) + Math.abs(maxEllipseY) * Math.sin(rotate20Rad);
        
        // 还要考虑作品本身的宽度（最清晰的作品最大）
        const maxWorkWidth = this.baseItemSize * 1.2; // 最清晰作品1.2倍大小
        const totalMaxWidth = maxWidth + maxWorkWidth;
        
        // 确保圆环不超出屏幕左右边界
        // 留出边距（50px）
        const margin = 50;
        const maxAllowedWidth = this.canvas.width - margin * 2;
        
        // 圆环直径 = 2 * radiusY
        const diameterY = this.radiusY * 2;
        // 向下移动圆环直径的1/3
        const offsetY = diameterY / 3;
        
        // 重新计算最大宽度（使用0.8倍缩小后的半径）
        let adjustedMaxEllipseX = this.radiusX * maxRadiusMultiplier;
        let adjustedMaxEllipseY = this.radiusY * maxRadiusMultiplier;
        let adjustedMaxRotatedX = adjustedMaxEllipseX * Math.cos(rotate45Z) - (-adjustedMaxEllipseY) * Math.sin(rotate45Z);
        let adjustedMaxWidth = Math.abs(adjustedMaxRotatedX) * Math.cos(rotate20Rad) + Math.abs(adjustedMaxEllipseY) * Math.sin(rotate20Rad);
        let adjustedTotalMaxWidth = adjustedMaxWidth + maxWorkWidth;
        
        // 如果圆环宽度超出屏幕，按比例缩小radiusX（确保左右不超出屏幕）
        if (adjustedTotalMaxWidth > maxAllowedWidth) {
            const scaleFactor = maxAllowedWidth / adjustedTotalMaxWidth;
            this.radiusX = this.radiusX * scaleFactor;
            this.radiusY = this.radiusY * scaleFactor;
            // 重新计算调整后的最大宽度
            adjustedMaxEllipseX = this.radiusX * maxRadiusMultiplier;
            adjustedMaxEllipseY = this.radiusY * maxRadiusMultiplier;
            adjustedMaxRotatedX = adjustedMaxEllipseX * Math.cos(rotate45Z) - (-adjustedMaxEllipseY) * Math.sin(rotate45Z);
            adjustedMaxWidth = Math.abs(adjustedMaxRotatedX) * Math.cos(rotate20Rad) + Math.abs(adjustedMaxEllipseY) * Math.sin(rotate20Rad);
            adjustedTotalMaxWidth = adjustedMaxWidth + maxWorkWidth;
        }
        
        // 圆环中心位于屏幕右侧中心线上的黄金分割点位置
        // 黄金分割比例：0.618（从左边算）
        const goldenRatio = 0.618;
        // 垂直方向：屏幕中心
        // 水平方向：黄金分割点（从左边算，0.618位置，这样在右侧）
        // 确保圆环不超出屏幕左右边界
        const minCenterX = margin + adjustedTotalMaxWidth / 2;
        const maxCenterX = this.canvas.width - margin - adjustedTotalMaxWidth / 2;
        const desiredCenterX = this.canvas.width * goldenRatio;
        this.centerX = Math.max(minCenterX, Math.min(desiredCenterX, maxCenterX));
        // 圆环整体上移50像素
        this.centerY = this.canvas.height / 2 + offsetY - 50;
        
        // 基础尺寸也相应缩小（3/5 * 0.8 = 0.48）
        this.baseItemSize = (isMobile ? 200 : 280) * 0.6 * 0.8;
        this.itemHeight = (isMobile ? 250 : 320) * 0.6 * 0.8;
    }
    
    onClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        
        for (let i = 0; i < this.works.length; i++) {
            const work = this.works[i];
            const pos = this.getWorkPosition(i);
            
            if (pos && work.image) {
                const baseWidth = this.baseItemSize * pos.scale;
                const baseHeight = this.baseItemSize * pos.scale;
                
                let displayWidth, displayHeight;
                if (work.aspectRatio > 1) {
                    displayWidth = baseWidth;
                    displayHeight = baseWidth / work.aspectRatio;
                } else {
                    displayHeight = baseHeight;
                    displayWidth = baseHeight * work.aspectRatio;
                }
                
                const textAreaHeight = 60 * pos.scale;
                const totalHeight = displayHeight + textAreaHeight;
                const totalWidth = displayWidth;
                
                const distanceX = Math.abs(clickX - pos.x);
                const distanceY = Math.abs(clickY - pos.y);
                
                if (distanceX < totalWidth / 2 && distanceY < totalHeight / 2) {
                    // 直接跳转到详情页，不使用动画
                    window.location.href = `work-detail.html?id=${work.id}`;
                    break;
                }
            }
        }
    }
    
    
    getWorkPosition(index) {
        const totalWorks = this.works.length;
        const angle = (Math.PI * 2 / totalWorks) * index + this.rotationY;
        
        // 椭圆弧形路径，整体逆时针旋转20度（相对于屏幕中心点）
        // 先在XY平面创建椭圆，然后整体逆时针旋转20度，再绕Z轴旋转45度，再绕X轴旋转45度向上
        const rotate20Deg = -20 * Math.PI / 180; // 逆时针20度（负值）
        const ellipseAngle = angle + rotate20Deg;
        
        // 根据z值调整半径，让最清楚的作品区域有更大的半径（增加间距）
        // 当ellipseY接近0时，作品最清楚，此时增加半径
        const ellipseY = Math.sin(ellipseAngle) * this.radiusY;
        const normalizedEllipseY = Math.abs(ellipseY) / this.radiusY; // 0到1，0表示最清楚的位置
        // 最清楚的作品与旁边两幅作品的间距更大，半径增加50%
        const radiusMultiplier = 1.0 + (1 - normalizedEllipseY) * 0.5; // 最清楚时半径增加50%
        
        // 椭圆在XY平面的参数（使用调整后的半径）
        const ellipseX = Math.cos(ellipseAngle) * this.radiusX * radiusMultiplier;
        const adjustedEllipseY = ellipseY * radiusMultiplier;
        
        // 绕Z轴顺时针旋转45度（让椭圆路径斜向上）
        const rotate45Z = Math.PI / 4; // 45度
        const rotatedX = ellipseX * Math.cos(rotate45Z) - adjustedEllipseY * Math.sin(rotate45Z);
        const rotatedY = ellipseX * Math.sin(rotate45Z) + adjustedEllipseY * Math.cos(rotate45Z);
        
        // 绕X轴旋转45度向上（增加深度）
        const rotation45X = Math.PI / 4; // 45度
        let x = rotatedX; // X轴不变
        let y = rotatedY * Math.cos(rotation45X); // Y轴压缩
        const z = rotatedY * Math.sin(rotation45X); // Z轴深度
        
        // 沿着垂直于屏幕的方向（Z轴）逆时针旋转30度
        const rotate30Z = -30 * Math.PI / 180; // 逆时针30度（负值）
        const finalX = x * Math.cos(rotate30Z) - y * Math.sin(rotate30Z);
        const finalY = x * Math.sin(rotate30Z) + y * Math.cos(rotate30Z);
        x = finalX;
        y = finalY;
        
        // 透视投影
        const perspective = 1000;
        const distance = z + perspective;
        const scale = perspective / distance;
        
        // 计算作品在椭圆上的位置（z值），最前面的（z最小，接近0）最大最清楚
        const maxZ = Math.abs(this.radiusY * Math.sin(rotation45X) * radiusMultiplier);
        const normalizedZForScale = (z + maxZ) / (maxZ * 2); // 0到1，0表示最前面（z最小）
        // 作品显示尺寸更大，最前面1.2倍，后面最小0.4倍（原来是最前面1.0倍，后面最小0.3倍）
        const scaleMultiplier = 0.4 + (1 - normalizedZForScale) * 0.8; // 最前面1.2倍，后面最小0.4倍
        
        // 屏幕坐标（中心点在屏幕中心）
        const screenX = this.centerX + x * scale;
        const screenY = this.centerY + y * scale;
        
        // 计算模糊程度（基于z值），最前面的（z最小）最清楚
        const normalizedZForBlur = (z + maxZ) / (maxZ * 2); // 0到1，0表示最前面
        const blurAmount = normalizedZForBlur; // 最前面0（最清楚），后面逐渐增加模糊
        
        return {
            x: screenX,
            y: screenY,
            scale: scaleMultiplier,
            z: z,
            angle: angle,
            blurAmount: blurAmount,
            distance: distance
        };
    }
    
    applyNoiseFilter(ctx, x, y, width, height, intensity) {
        if (intensity > 0) {
            ctx.save();
            ctx.globalCompositeOperation = 'overlay';
            ctx.globalAlpha = intensity * 0.4;
            ctx.drawImage(
                this.noiseCanvas,
                0, 0, this.noiseCanvas.width, this.noiseCanvas.height,
                x, y, width, height
            );
            ctx.restore();
        }
    }
    
    drawWork(index, pos) {
        if (!pos) return;
        
        const work = this.works[index];
        if (!work.image) return; // 如果图片未加载，跳过
        
        // 检查是否悬停，如果悬停则放大1.2倍
        const hoverScale = (this.hoveredWorkIndex === index) ? 1.2 : 1.0;
        
        // 基础尺寸，最前面的作品最大
        const baseWidth = this.baseItemSize * pos.scale * hoverScale;
        const baseHeight = this.baseItemSize * pos.scale * hoverScale;
        
        // 根据图片宽高比计算实际显示尺寸
        let displayWidth, displayHeight;
        if (work.aspectRatio > 1) {
            // 横向图片（宽>高）
            displayWidth = baseWidth;
            displayHeight = baseWidth / work.aspectRatio;
        } else {
            // 纵向图片或正方形（高>=宽）
            displayHeight = baseHeight;
            displayWidth = baseHeight * work.aspectRatio;
        }
        
        // 文字区域高度（也随悬停缩放）
        const textAreaHeight = 60 * pos.scale * hoverScale;
        const totalHeight = displayHeight + textAreaHeight;
        
        this.ctx.save();
        this.ctx.translate(pos.x, pos.y);
        
        // 根据距离调整透明度，最前面的最清楚
        const normalizedZ = Math.abs(pos.z) / this.radiusX;
        const alpha = Math.max(0.4, Math.min(1, 1 - normalizedZ * 0.3));
        this.ctx.globalAlpha = alpha;
        
        // 创建离屏canvas（考虑悬停放大，增加padding避免裁剪）
        const padding = 20 * hoverScale;
        const offscreenCanvas = document.createElement('canvas');
        const offscreenCtx = offscreenCanvas.getContext('2d');
        offscreenCanvas.width = displayWidth + padding * 2;
        offscreenCanvas.height = totalHeight + padding * 2;
        
        const offsetX = offscreenCanvas.width / 2;
        const offsetY = padding + displayHeight / 2;
        
        // 绘制图片（无边框，极简风格）
        if (work.image) {
            offscreenCtx.drawImage(
                work.image,
                offsetX - displayWidth / 2,
                padding,
                displayWidth,
                displayHeight
            );
        }
        
        // 绘制作品标题和尺寸（文字大小也随悬停缩放）
        const textY = padding + displayHeight + 15 * pos.scale * hoverScale;
        offscreenCtx.fillStyle = '#ffffff';
        const titleFontSize = Math.max(12, Math.min(16, 14 * pos.scale * hoverScale));
        const sizeFontSize = Math.max(10, Math.min(12, 11 * pos.scale * hoverScale));
        
        offscreenCtx.font = `${titleFontSize}px 'HarmonyOS Sans', sans-serif`;
        offscreenCtx.textAlign = 'center';
        offscreenCtx.textBaseline = 'top';
        offscreenCtx.fillText(work.title, offsetX, textY);
        
        offscreenCtx.font = `${sizeFontSize}px 'HarmonyOS Sans', sans-serif`;
        offscreenCtx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        offscreenCtx.fillText(work.size, offsetX, textY + titleFontSize + 6);
        
        // 应用模糊效果，最前面的最清楚（blurAmount接近0）
        if (pos.blurAmount > 0.05) {
            const blurValue = pos.blurAmount * 20; // 增加模糊强度
            this.ctx.filter = `blur(${blurValue}px)`;
        } else {
            this.ctx.filter = 'none';
        }
        
        // 绘制到主canvas
        this.ctx.drawImage(
            offscreenCanvas,
            -offscreenCanvas.width / 2,
            -offscreenCanvas.height / 2
        );
        
        // 重置filter
        this.ctx.filter = 'none';
        
        // 应用噪点效果（距离越远，噪点越明显）
        if (pos.blurAmount > 0.1) {
            this.applyNoiseFilter(
                this.ctx,
                -offscreenCanvas.width / 2,
                -offscreenCanvas.height / 2,
                offscreenCanvas.width,
                offscreenCanvas.height,
                pos.blurAmount
            );
        }
        
        this.ctx.restore();
    }
    
    animate() {
        if (!this.canvas || !this.ctx) return;
        
        // 平滑旋转
        this.rotationY += (this.targetRotationY - this.rotationY) * 0.15;
        
        // 自动慢速旋转（当没有拖动时）
        if (!this.isDragging && Math.abs(this.targetRotationY - this.rotationY) < 0.01) {
            this.targetRotationY += this.autoRotateSpeed;
        }
        
        // 清空画布
        this.ctx.fillStyle = 'rgb(15, 16, 17)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 按z轴深度排序（z越小越前面，应该先绘制）
        const worksWithPos = this.works.map((work, index) => {
            const pos = this.getWorkPosition(index);
            return { work, index, pos };
        }).filter(item => item.pos && item.work.image);
        
        worksWithPos.sort((a, b) => a.pos.z - b.pos.z); // z越小越前面
        
        // 绘制所有作品
        worksWithPos.forEach(({ index, pos }) => {
            this.drawWork(index, pos);
        });
        
        requestAnimationFrame(() => this.animate());
    }
}

// 初始化
window.addEventListener('DOMContentLoaded', () => {
    new WorksRing();
});
