using System;
using System.Threading.Tasks;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using Microsoft.Extensions.Configuration;

namespace PortalEventos.Api.Services 
{
    public class EmailService
    {
        private readonly IConfiguration _config;

        public EmailService(IConfiguration config)
        {
            _config = config;
        }

        // Disparo do Link de Confirmação
        public async Task EnviarEmailAtivacaoAsync(string emailDestinatario, string nomeUsuario, string token)
        {
            var linkConfirmacao = $"http://localhost:5173/confirmar-email?token={token}";

            var mensagem = new MimeMessage();
            mensagem.From.Add(new MailboxAddress("Portal de Eventos", "siqueiravini29@gmail.com"));
            mensagem.To.Add(new MailboxAddress(nomeUsuario, emailDestinatario));
            mensagem.Subject = "Ative a sua conta no Portal de Eventos";

            var bodyBuilder = new BodyBuilder
            {
                HtmlBody = $@"
                    <div style='font-family: sans-serif; max-width: 600px; border: 1px solid #e2e8f0; padding: 24px; border-radius: 12px;'>
                        <h2 style='color: #2563eb;'>Bem-vindo, {nomeUsuario}!</h2>
                        <p>Obrigado por se registar. Para começar a garantir os seus ingressos, precisa de confirmar este endereço de e-mail.</p>
                        <div style='margin: 32px 0;'>
                            <a href='{linkConfirmacao}' 
                               style='background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;'>
                               Confirmar E-mail
                            </a>
                        </div>
                        <p style='font-size: 12px; color: #64748b;'>Se o botão não funcionar, copie e cole este link no navegador: <br/> {linkConfirmacao}</p>
                    </div>"
            };

            mensagem.Body = bodyBuilder.ToMessageBody();

            await ExecutarEnvioSmtpAsync(mensagem);
        }

        // Disparo do Ingresso 
        public async Task EnviarIngressoAsync(string emailDestinatario, string nomeUsuario, string nomeEvento, string ticketHash, decimal valorIngresso)
        {
            var mensagem = new MimeMessage();
            mensagem.From.Add(new MailboxAddress("Portal de Eventos", "siqueiravini29@gmail")); 
            mensagem.To.Add(new MailboxAddress(nomeUsuario, emailDestinatario));
            mensagem.Subject = $"Confirmação de Inscrição: {nomeEvento}";

            // Lógica para formatação do preço
            string valorFormatado = valorIngresso == 0 ? "GRATUITO" : $"R$ {valorIngresso:F2}";
            
            // URL do ingresso no seu React
            string urlTicket = $"http://localhost:5173/ticket/{ticketHash}";
            
            // URL da imagem gerada dinamicamente pelo QR Server
            string urlQrCodeImagem = $"https://api.qrserver.com/v1/create-qr-code/?size=250x250&data={Uri.EscapeDataString(urlTicket)}";

            var bodyBuilder = new BodyBuilder
            {
                HtmlBody = $@"
                    <div style='font-family: sans-serif; padding: 30px; border: 1px solid #e2e8f0; max-width: 600px; border-radius: 12px; margin: 0 auto; text-align: center;'>
                        
                        <h2 style='color: #1e40af; margin-bottom: 5px;'>Sua vaga está garantida!</h2>
                        <p style='color: #475569; font-size: 16px;'>Olá, <strong>{nomeUsuario}</strong>!</p>
                        <p style='color: #475569;'>A sua inscrição no evento <strong>{nomeEvento}</strong> foi confirmada com sucesso.</p>
                        
                        <div style='background-color: #f8fafc; border: 1px solid #cbd5e1; padding: 15px; border-radius: 8px; margin: 25px 0;'>
                            <p style='margin: 0; color: #64748b; font-size: 14px;'>Total Pago</p>
                            <p style='margin: 5px 0 0 0; font-size: 24px; font-weight: bold; color: #0f172a;'>{valorFormatado}</p>
                        </div>

                        <div style='margin: 30px 0;'>
                            <p style='color: #64748b; font-size: 14px; margin-bottom: 15px;'>Apresente este QR Code diretamente na portaria do evento:</p>
                            <img src='{urlQrCodeImagem}' alt='QR Code do Ingresso' style='border: 4px solid #fff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border-radius: 8px; width: 200px; height: 200px;' />
                        </div>

                        <div style='margin: 40px 0 20px 0;'>
                            <a href='{urlTicket}' 
                            style='background-color: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;'>
                            Imprimir Ingresso em PDF
                            </a>
                        </div>
                        
                        <hr style='border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;' />
                        <small style='color: #94a3b8;'>Este é um e-mail automático, por favor não responda.</small>
                    </div>"
            };

            mensagem.Body = bodyBuilder.ToMessageBody();

            await ExecutarEnvioSmtpAsync(mensagem);
        }

        // Método privado para não repetir a lógica de conexão em cada e-mail
        private async Task ExecutarEnvioSmtpAsync(MimeMessage mensagem)
        {
            using var client = new SmtpClient();
            try
            {
                // Configuração específica para o Gmail 
                await client.ConnectAsync("smtp.gmail.com", 587, SecureSocketOptions.StartTls);
                
                await client.AuthenticateAsync("siqueiravini29@gmail.com", "fysa iesi jixz xnus ");
                
                await client.SendAsync(mensagem);
                await client.DisconnectAsync(true);
            }
            catch (Exception ex)
            {
                // Num ambiente de produção, isto seria gravado no Serilog/ILogger
                Console.WriteLine($"Falha no envio de e-mail SMTP: {ex.Message}");
            }
        }
    }
}