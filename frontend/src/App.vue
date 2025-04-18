<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <v-toolbar-title class="text-left" style="margin-left: 15">File Database System</v-toolbar-title>
<v-spacer></v-spacer>
      <v-btn text @click="showUploadDialog = true">
        <v-icon left>mdi-upload</v-icon>
        Upload File
      </v-btn>
    </v-app-bar>

    <v-main>
      <v-container fluid>
        <!-- Search Bar -->
        <v-row class="mb-4">
          <v-col cols="12" sm="8" md="6" lg="4">
            <v-text-field
              v-model="search"
              label="Search Files"
              clearable
            ></v-text-field>
          </v-col>
        </v-row>

        <!-- File Grid -->
        <v-row>
          <v-col
            v-for="file in files"
            :key="file.id"
            cols="12"
            sm="6"
            md="4"
            lg="3"
          >
            <v-card>
              <v-card-title>{{ file.name }}</v-card-title>
              <v-card-text>
                <div>Size: {{ file.size }}</div>
                <div>Type: {{ file.type }}</div>
                <div>Upload Date: {{ file.uploadDate }}</div>
              </v-card-text>
              <v-card-actions>
                <v-btn text color="primary" @click="downloadFile(file)">
                  <v-icon left>mdi-download</v-icon>
                  Download
                </v-btn>
                <v-btn text color="error" @click="deleteFile(file)">
                  <v-icon left>mdi-delete</v-icon>
                  Delete
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-container>

      <!-- Upload Dialog -->
      <v-dialog v-model="showUploadDialog" max-width="500px">
        <v-card>
          <v-card-title>Upload New File</v-card-title>
          <v-card-text>
            <v-file-input
              v-model="selectedFile"
              label="Select File"
              show-size
              prepend-icon="mdi-file"
            ></v-file-input>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="showUploadDialog = false">Cancel</v-btn>
            <v-btn color="primary" @click="uploadFile">Upload</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-main>
    <loading-overlay :loading="loading" />
    
    <v-snackbar v-model="showError" color="error">
      {{ errorMessage }}
      <template v-slot:action="{ attrs }">
        <v-btn text v-bind="attrs" @click="showError = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>
<script>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const API_URL = 'http://localhost:3001/api'

export default {
  name: 'App',
  setup() {
    const search = ref('')
    const showUploadDialog = ref(false)
    const selectedFile = ref(null)
    const files = ref([])
    const loading = ref(false)
    const showError = ref(false)
    const errorMessage = ref('')

    // Fetch files when component mounts
    onMounted(async () => {
      await fetchFiles()
    })

    const fetchFiles = async () => {
      loading.value = true
      try {
        const response = await axios.get(`${API_URL}/files`)
        files.value = response.data.map(file => ({
          id: file._id,
          name: file.originalName,
          size: formatFileSize(file.size),
          type: file.type,
          uploadDate: new Date(file.uploadDate).toLocaleDateString()
        }))
      } catch (error) {
        errorMessage.value = 'Failed to fetch files'
        showError.value = true
      } finally {
        loading.value = false
      }
    }

    const uploadFile = async () => {
      if (selectedFile.value) {
        const formData = new FormData()
        formData.append('file', selectedFile.value)
        
        await axios.post(`${API_URL}/upload`, formData)
        await fetchFiles()
        
        showUploadDialog.value = false
        selectedFile.value = null
      }
    }

    const downloadFile = async (file) => {
      const response = await axios.get(`${API_URL}/files/${file.id}`, {
        responseType: 'blob'
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', file.name)
      document.body.appendChild(link)
      link.click()
      link.remove()
    }

    const deleteFile = async (file) => {
      await axios.delete(`${API_URL}/files/${file.id}`)
      await fetchFiles()
    }

    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    return {
      search,
      showUploadDialog,
      selectedFile,
      files,
      downloadFile,
      deleteFile,
      uploadFile,
      loading,
      showError,
      errorMessage
    }
  },
}
</script>
<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
