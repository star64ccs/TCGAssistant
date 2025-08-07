const { logger } = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');

class FileManagerService {
  constructor() {
    this.files = new Map();
    this.folders = new Map();
    this.uploadsDir = 'uploads';
    this.ensureUploadsDirectory();
  }

  // 確保上傳目錄存在
  async ensureUploadsDirectory() {
    try {
      await fs.mkdir(this.uploadsDir, { recursive: true });
    } catch (error) {
      logger.error('創建上傳目錄失敗:', error);
    }
  }

  // 上傳文件
  async uploadFiles(userId, files, options = {}) {
    try {
      const { category = 'general', description = '', tags = [] } = options;
      const uploadedFiles = [];

      for (const file of files) {
        const fileId = uuidv4();
        const timestamp = new Date();
        
        // 生成唯一文件名
        const fileExtension = path.extname(file.originalname);
        const fileName = `${fileId}${fileExtension}`;
        const filePath = path.join(this.uploadsDir, fileName);

        // 保存文件
        await fs.writeFile(filePath, file.buffer);

        // 獲取文件信息
        const fileStats = await fs.stat(filePath);
        const mimeType = this.getMimeType(fileExtension);

        // 創建文件記錄
        const fileRecord = {
          id: fileId,
          userId,
          originalName: file.originalname,
          fileName,
          filePath,
          mimeType,
          size: fileStats.size,
          category,
          description,
          tags,
          type: this.getFileType(mimeType),
          createdAt: timestamp,
          updatedAt: timestamp
        };

        this.files.set(fileId, fileRecord);
        uploadedFiles.push(fileRecord);
        
        logger.info(`文件已上傳: ${fileId} 用戶 ${userId}`);
      }

      return uploadedFiles;
    } catch (error) {
      logger.error('上傳文件錯誤:', error);
      throw new Error('上傳文件失敗');
    }
  }

  // 獲取文件列表
  async getFileList(userId, options = {}) {
    try {
      const { page = 1, limit = 20, category, type, search, sortBy = 'createdAt', sortOrder = 'desc' } = options;
      
      let files = Array.from(this.files.values())
        .filter(f => f.userId === userId);

      // 篩選條件
      if (category) {
        files = files.filter(f => f.category === category);
      }
      if (type) {
        files = files.filter(f => f.type === type);
      }
      if (search) {
        const searchLower = search.toLowerCase();
        files = files.filter(f => 
          f.originalName.toLowerCase().includes(searchLower) ||
          f.description.toLowerCase().includes(searchLower) ||
          f.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }

      // 排序
      files.sort((a, b) => {
        let aValue = a[sortBy];
        let bValue = b[sortBy];
        
        if (sortBy === 'size') {
          aValue = parseInt(aValue) || 0;
          bValue = parseInt(bValue) || 0;
        } else if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        }
        
        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });

      // 分頁
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedFiles = files.slice(startIndex, endIndex);

      return {
        files: paginatedFiles,
        pagination: {
          page,
          limit,
          total: files.length,
          totalPages: Math.ceil(files.length / limit)
        }
      };
    } catch (error) {
      logger.error('獲取文件列表錯誤:', error);
      throw new Error('獲取文件列表失敗');
    }
  }

  // 獲取文件詳情
  async getFileDetail(fileId, userId) {
    try {
      const file = this.files.get(fileId);
      if (!file || file.userId !== userId) {
        throw new Error('文件不存在或無權限');
      }

      return file;
    } catch (error) {
      logger.error('獲取文件詳情錯誤:', error);
      throw error;
    }
  }

  // 下載文件
  async downloadFile(fileId, userId) {
    try {
      const file = this.files.get(fileId);
      if (!file || file.userId !== userId) {
        throw new Error('文件不存在或無權限');
      }

      const fileBuffer = await fs.readFile(file.filePath);
      
      return {
        buffer: fileBuffer,
        filename: file.originalName,
        mimeType: file.mimeType,
        size: file.size
      };
    } catch (error) {
      logger.error('下載文件錯誤:', error);
      throw new Error('下載文件失敗');
    }
  }

  // 預覽文件
  async previewFile(fileId, userId) {
    try {
      const file = this.files.get(fileId);
      if (!file || file.userId !== userId) {
        throw new Error('文件不存在或無權限');
      }

      // 檢查是否為圖片
      if (this.isImage(file.mimeType)) {
        const fileBuffer = await fs.readFile(file.filePath);
        return {
          buffer: fileBuffer,
          mimeType: file.mimeType,
          size: file.size
        };
      } else {
        // 對於非圖片文件，返回基本信息
        return {
          buffer: Buffer.from('預覽不可用'),
          mimeType: 'text/plain',
          size: file.size,
          preview: false
        };
      }
    } catch (error) {
      logger.error('預覽文件錯誤:', error);
      throw new Error('預覽文件失敗');
    }
  }

  // 更新文件信息
  async updateFile(fileId, userId, updates) {
    try {
      const file = this.files.get(fileId);
      if (!file || file.userId !== userId) {
        throw new Error('文件不存在或無權限');
      }

      // 只允許更新特定字段
      const allowedUpdates = ['name', 'description', 'category', 'tags'];
      const updatedFile = { ...file };

      for (const [key, value] of Object.entries(updates)) {
        if (allowedUpdates.includes(key)) {
          updatedFile[key] = value;
        }
      }

      updatedFile.updatedAt = new Date();
      this.files.set(fileId, updatedFile);
      
      logger.info(`文件信息已更新: ${fileId}`);
      return updatedFile;
    } catch (error) {
      logger.error('更新文件信息錯誤:', error);
      throw error;
    }
  }

  // 刪除文件
  async deleteFile(fileId, userId) {
    try {
      const file = this.files.get(fileId);
      if (!file || file.userId !== userId) {
        throw new Error('文件不存在或無權限');
      }

      // 刪除物理文件
      try {
        await fs.unlink(file.filePath);
      } catch (fileError) {
        logger.warn(`刪除物理文件失敗: ${file.filePath}`, fileError);
      }

      // 刪除記錄
      this.files.delete(fileId);
      
      logger.info(`文件已刪除: ${fileId}`);
      return { success: true };
    } catch (error) {
      logger.error('刪除文件錯誤:', error);
      throw error;
    }
  }

  // 圖片處理
  async processImage(fileId, userId, operations) {
    try {
      const file = this.files.get(fileId);
      if (!file || file.userId !== userId) {
        throw new Error('文件不存在或無權限');
      }

      if (!this.isImage(file.mimeType)) {
        throw new Error('文件不是圖片格式');
      }

      let image = sharp(file.filePath);

      // 應用處理操作
      for (const operation of operations) {
        switch (operation.type) {
          case 'resize':
            image = image.resize(operation.params?.width, operation.params?.height);
            break;
          case 'crop':
            image = image.extract(operation.params);
            break;
          case 'rotate':
            image = image.rotate(operation.params?.angle || 0);
            break;
          case 'filter':
            if (operation.params?.filter === 'grayscale') {
              image = image.grayscale();
            }
            break;
          case 'compress':
            image = image.jpeg({ quality: operation.params?.quality || 80 });
            break;
          default:
            logger.warn(`不支持的圖片處理操作: ${operation.type}`);
        }
      }

      // 生成處理後的文件
      const processedFileId = uuidv4();
      const processedFileName = `processed_${processedFileId}.jpg`;
      const processedFilePath = path.join(this.uploadsDir, processedFileName);

      await image.toFile(processedFilePath);

      // 創建處理後的文件記錄
      const processedFile = {
        id: processedFileId,
        userId,
        originalName: `processed_${file.originalName}`,
        fileName: processedFileName,
        filePath: processedFilePath,
        mimeType: 'image/jpeg',
        size: (await fs.stat(processedFilePath)).size,
        category: file.category,
        description: `處理後的圖片 - ${file.description}`,
        tags: [...file.tags, 'processed'],
        type: 'image',
        parentFileId: fileId,
        operations,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.files.set(processedFileId, processedFile);
      
      logger.info(`圖片已處理: ${processedFileId}`);
      return processedFile;
    } catch (error) {
      logger.error('圖片處理錯誤:', error);
      throw new Error('圖片處理失敗');
    }
  }

  // 批量操作文件
  async batchAction(fileIds, action, data, userId) {
    try {
      const results = [];
      
      for (const fileId of fileIds) {
        try {
          let result;
          switch (action) {
            case 'delete':
              result = await this.deleteFile(fileId, userId);
              break;
            case 'move':
              result = await this.moveFile(fileId, data.targetFolderId, userId);
              break;
            case 'copy':
              result = await this.copyFile(fileId, data.targetFolderId, data.newName, userId);
              break;
            case 'download':
              result = await this.downloadFile(fileId, userId);
              break;
            default:
              throw new Error(`不支持的操作: ${action}`);
          }
          results.push({ success: true, fileId, result });
        } catch (error) {
          results.push({ success: false, fileId, error: error.message });
        }
      }

      return {
        success: true,
        results,
        summary: {
          total: fileIds.length,
          successful: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length
        }
      };
    } catch (error) {
      logger.error('批量操作文件錯誤:', error);
      throw new Error('批量操作文件失敗');
    }
  }

  // 獲取文件統計
  async getFileStats(userId) {
    try {
      const files = Array.from(this.files.values())
        .filter(f => f.userId === userId);

      const stats = {
        total: files.length,
        byType: {},
        byCategory: {},
        totalSize: files.reduce((sum, f) => sum + f.size, 0),
        averageSize: files.length > 0 ? files.reduce((sum, f) => sum + f.size, 0) / files.length : 0,
        recentUploads: files
          .filter(f => new Date(f.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
          .length
      };

      // 按類型和分類統計
      files.forEach(f => {
        stats.byType[f.type] = (stats.byType[f.type] || 0) + 1;
        stats.byCategory[f.category] = (stats.byCategory[f.category] || 0) + 1;
      });

      return stats;
    } catch (error) {
      logger.error('獲取文件統計錯誤:', error);
      throw new Error('獲取文件統計失敗');
    }
  }

  // 獲取存儲使用情況
  async getStorageStats(userId) {
    try {
      const files = Array.from(this.files.values())
        .filter(f => f.userId === userId);

      const storageStats = {
        totalFiles: files.length,
        totalSize: files.reduce((sum, f) => sum + f.size, 0),
        byType: {},
        byCategory: {},
        largestFile: files.length > 0 ? files.reduce((max, f) => f.size > max.size ? f : max) : null,
        averageFileSize: files.length > 0 ? files.reduce((sum, f) => sum + f.size, 0) / files.length : 0
      };

      // 按類型和分類統計大小
      files.forEach(f => {
        if (!storageStats.byType[f.type]) {
          storageStats.byType[f.type] = { count: 0, size: 0 };
        }
        storageStats.byType[f.type].count++;
        storageStats.byType[f.type].size += f.size;

        if (!storageStats.byCategory[f.category]) {
          storageStats.byCategory[f.category] = { count: 0, size: 0 };
        }
        storageStats.byCategory[f.category].count++;
        storageStats.byCategory[f.category].size += f.size;
      });

      return storageStats;
    } catch (error) {
      logger.error('獲取存儲使用情況錯誤:', error);
      throw new Error('獲取存儲使用情況失敗');
    }
  }

  // 創建文件夾
  async createFolder(userId, { name, parentId, description }) {
    try {
      const folderId = uuidv4();
      const folder = {
        id: folderId,
        userId,
        name,
        parentId: parentId || null,
        description: description || '',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.folders.set(folderId, folder);
      
      logger.info(`文件夾已創建: ${folderId} 用戶 ${userId}`);
      return folder;
    } catch (error) {
      logger.error('創建文件夾錯誤:', error);
      throw new Error('創建文件夾失敗');
    }
  }

  // 獲取文件夾結構
  async getFolderStructure(userId) {
    try {
      const folders = Array.from(this.folders.values())
        .filter(f => f.userId === userId);

      const buildTree = (parentId = null) => {
        return folders
          .filter(f => f.parentId === parentId)
          .map(folder => ({
            ...folder,
            children: buildTree(folder.id)
          }));
      };

      return buildTree();
    } catch (error) {
      logger.error('獲取文件夾結構錯誤:', error);
      throw new Error('獲取文件夾結構失敗');
    }
  }

  // 移動文件
  async moveFile(fileId, targetFolderId, userId) {
    try {
      const file = this.files.get(fileId);
      if (!file || file.userId !== userId) {
        throw new Error('文件不存在或無權限');
      }

      // 檢查目標文件夾是否存在
      if (targetFolderId) {
        const targetFolder = this.folders.get(targetFolderId);
        if (!targetFolder || targetFolder.userId !== userId) {
          throw new Error('目標文件夾不存在或無權限');
        }
      }

      file.folderId = targetFolderId;
      file.updatedAt = new Date();
      this.files.set(fileId, file);
      
      logger.info(`文件已移動: ${fileId} 到文件夾 ${targetFolderId}`);
      return { success: true };
    } catch (error) {
      logger.error('移動文件錯誤:', error);
      throw error;
    }
  }

  // 複製文件
  async copyFile(fileId, targetFolderId, newName, userId) {
    try {
      const originalFile = this.files.get(fileId);
      if (!originalFile || originalFile.userId !== userId) {
        throw new Error('文件不存在或無權限');
      }

      const newFileId = uuidv4();
      const timestamp = new Date();
      
      // 生成新文件名
      const fileExtension = path.extname(originalFile.originalName);
      const fileName = `${newFileId}${fileExtension}`;
      const filePath = path.join(this.uploadsDir, fileName);

      // 複製物理文件
      await fs.copyFile(originalFile.filePath, filePath);

      // 創建新文件記錄
      const copiedFile = {
        ...originalFile,
        id: newFileId,
        originalName: newName || `copy_${originalFile.originalName}`,
        fileName,
        filePath,
        folderId: targetFolderId,
        description: `複製自: ${originalFile.description}`,
        tags: [...originalFile.tags, 'copied'],
        createdAt: timestamp,
        updatedAt: timestamp
      };

      this.files.set(newFileId, copiedFile);
      
      logger.info(`文件已複製: ${newFileId} 從 ${fileId}`);
      return copiedFile;
    } catch (error) {
      logger.error('複製文件錯誤:', error);
      throw new Error('複製文件失敗');
    }
  }

  // 搜索文件
  async searchFiles(userId, options = {}) {
    try {
      const { query, type, category, dateRange, sizeRange } = options;
      
      let files = Array.from(this.files.values())
        .filter(f => f.userId === userId);

      // 文本搜索
      if (query) {
        const queryLower = query.toLowerCase();
        files = files.filter(f => 
          f.originalName.toLowerCase().includes(queryLower) ||
          f.description.toLowerCase().includes(queryLower) ||
          f.tags.some(tag => tag.toLowerCase().includes(queryLower))
        );
      }

      // 類型篩選
      if (type) {
        files = files.filter(f => f.type === type);
      }

      // 分類篩選
      if (category) {
        files = files.filter(f => f.category === category);
      }

      // 日期範圍篩選
      if (dateRange) {
        if (dateRange.start) {
          files = files.filter(f => new Date(f.createdAt) >= new Date(dateRange.start));
        }
        if (dateRange.end) {
          files = files.filter(f => new Date(f.createdAt) <= new Date(dateRange.end));
        }
      }

      // 大小範圍篩選
      if (sizeRange) {
        if (sizeRange.min) {
          files = files.filter(f => f.size >= sizeRange.min);
        }
        if (sizeRange.max) {
          files = files.filter(f => f.size <= sizeRange.max);
        }
      }

      return files;
    } catch (error) {
      logger.error('搜索文件錯誤:', error);
      throw new Error('搜索文件失敗');
    }
  }

  // 輔助方法
  getMimeType(extension) {
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.txt': 'text/plain'
    };
    return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
  }

  getFileType(mimeType) {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType === 'application/pdf') return 'document';
    if (mimeType.includes('word') || mimeType.includes('excel')) return 'document';
    if (mimeType === 'text/plain') return 'text';
    return 'other';
  }

  isImage(mimeType) {
    return mimeType.startsWith('image/');
  }
}

module.exports = new FileManagerService();
