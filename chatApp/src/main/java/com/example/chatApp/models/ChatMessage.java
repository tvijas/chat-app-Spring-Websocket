package com.example.chatApp.models;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChatMessage {
    private String content;
    private String sender;
    private MessageType type;
    private String fileData;
    private String fileName;

    public enum MessageType {
        CHAT, JOIN, LEAVE, IMAGE, VIDEO, AUDIO
    }
}
